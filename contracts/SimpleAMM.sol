// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LPToken.sol";

contract SimpleAMM is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant FEE_NUMERATOR = 997;
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant PRICE_PRECISION = 1e18;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    LPToken public immutable lpToken;

    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;

    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityBurned
    );

    event Swapped(
        address indexed trader,
        address indexed tokenIn,
        uint256 amountIn,
        address indexed tokenOut,
        uint256 amountOut
    );

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "Invalid token A");
        require(_tokenB != address(0), "Invalid token B");
        require(_tokenA != _tokenB, "Tokens must be different");

        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        lpToken = new LPToken();
    }

    modifier ensureDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, "Transaction expired");
        _;
    }

    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 liquidityMinted) {
        return _addLiquidity(amountA, amountB, 0, block.timestamp);
    }

    function addLiquidity(
        uint256 amountA,
        uint256 amountB,
        uint256 minLiquidity,
        uint256 deadline
    )
        external
        nonReentrant
        ensureDeadline(deadline)
        returns (uint256 liquidityMinted)
    {
        return _addLiquidity(amountA, amountB, minLiquidity, deadline);
    }

    function removeLiquidity(
        uint256 liquidityAmount
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        return _removeLiquidity(liquidityAmount, 0, 0, block.timestamp);
    }

    function removeLiquidity(
        uint256 liquidityAmount,
        uint256 minAmountA,
        uint256 minAmountB,
        uint256 deadline
    )
        external
        nonReentrant
        ensureDeadline(deadline)
        returns (uint256 amountA, uint256 amountB)
    {
        return _removeLiquidity(liquidityAmount, minAmountA, minAmountB, deadline);
    }

    function swapExactTokenAForTokenB(
        uint256 amountAIn,
        uint256 minAmountBOut
    ) external nonReentrant returns (uint256 amountBOut) {
        return _swap(address(tokenA), amountAIn, minAmountBOut, block.timestamp);
    }

    function swapExactTokenAForTokenB(
        uint256 amountAIn,
        uint256 minAmountBOut,
        uint256 deadline
    )
        external
        nonReentrant
        ensureDeadline(deadline)
        returns (uint256 amountBOut)
    {
        return _swap(address(tokenA), amountAIn, minAmountBOut, deadline);
    }

    function swapExactTokenBForTokenA(
        uint256 amountBIn,
        uint256 minAmountAOut
    ) external nonReentrant returns (uint256 amountAOut) {
        return _swap(address(tokenB), amountBIn, minAmountAOut, block.timestamp);
    }

    function swapExactTokenBForTokenA(
        uint256 amountBIn,
        uint256 minAmountAOut,
        uint256 deadline
    )
        external
        nonReentrant
        ensureDeadline(deadline)
        returns (uint256 amountAOut)
    {
        return _swap(address(tokenB), amountBIn, minAmountAOut, deadline);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    function getK() external view returns (uint256) {
        return reserveA * reserveB;
    }

    function getPriceAInB() external view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "Empty pool");
        return (reserveB * PRICE_PRECISION) / reserveA;
    }

    function getPriceBInA() external view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "Empty pool");
        return (reserveA * PRICE_PRECISION) / reserveB;
    }

    function getAmountOut(
        address tokenIn,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input");
        require(reserveA > 0 && reserveB > 0, "Empty pool");

        uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        if (tokenIn == address(tokenA)) {
            amountOut = (amountInWithFee * reserveB) / (reserveA + amountInWithFee);
        } else if (tokenIn == address(tokenB)) {
            amountOut = (amountInWithFee * reserveA) / (reserveB + amountInWithFee);
        } else {
            revert("Unsupported token");
        }
    }

    function quoteAddLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external view returns (uint256 liquidityMinted) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        if (totalLiquidity == 0) {
            return _sqrt(amountA * amountB);
        }

        uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
        uint256 liquidityB = (amountB * totalLiquidity) / reserveB;

        return _min(liquidityA, liquidityB);
    }

    function _addLiquidity(
        uint256 amountA,
        uint256 amountB,
        uint256 minLiquidity,
        uint256
    ) private returns (uint256 liquidityMinted) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        if (totalLiquidity == 0) {
            liquidityMinted = _sqrt(amountA * amountB);
        } else {
            require(amountA * reserveB == amountB * reserveA, "Invalid pool ratio");

            uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
            uint256 liquidityB = (amountB * totalLiquidity) / reserveB;

            liquidityMinted = _min(liquidityA, liquidityB);
        }

        require(liquidityMinted > 0, "Zero liquidity minted");
        require(liquidityMinted >= minLiquidity, "Insufficient liquidity minted");

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        totalLiquidity += liquidityMinted;
        reserveA += amountA;
        reserveB += amountB;

        lpToken.mint(msg.sender, liquidityMinted);

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
    }

    function _removeLiquidity(
        uint256 liquidityAmount,
        uint256 minAmountA,
        uint256 minAmountB,
        uint256
    ) private returns (uint256 amountA, uint256 amountB) {
        require(liquidityAmount > 0, "Invalid liquidity");
        require(totalLiquidity > 0, "Empty pool");
        require(lpToken.balanceOf(msg.sender) >= liquidityAmount, "Not enough LP");

        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        require(amountA >= minAmountA, "Insufficient token A output");
        require(amountB >= minAmountB, "Insufficient token B output");

        totalLiquidity -= liquidityAmount;
        reserveA -= amountA;
        reserveB -= amountB;

        lpToken.burn(msg.sender, liquidityAmount);

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
    }

    function _swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256
    ) private returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input");
        require(reserveA > 0 && reserveB > 0, "Empty pool");

        amountOut = getAmountOut(tokenIn, amountIn);

        require(amountOut > 0, "Zero output");
        require(amountOut >= minAmountOut, "Slippage too high");

        if (tokenIn == address(tokenA)) {
            require(amountOut < reserveB, "Not enough liquidity");

            tokenA.safeTransferFrom(msg.sender, address(this), amountIn);

            reserveA += amountIn;
            reserveB -= amountOut;

            tokenB.safeTransfer(msg.sender, amountOut);

            emit Swapped(msg.sender, address(tokenA), amountIn, address(tokenB), amountOut);
        } else if (tokenIn == address(tokenB)) {
            require(amountOut < reserveA, "Not enough liquidity");

            tokenB.safeTransferFrom(msg.sender, address(this), amountIn);

            reserveB += amountIn;
            reserveA -= amountOut;

            tokenA.safeTransfer(msg.sender, amountOut);

            emit Swapped(msg.sender, address(tokenB), amountIn, address(tokenA), amountOut);
        } else {
            revert("Unsupported token");
        }
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }

    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = (y / 2) + 1;

            while (x < z) {
                z = x;
                x = ((y / x) + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}