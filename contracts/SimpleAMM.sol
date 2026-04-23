pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleAMM {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidityOf;

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
        require(_tokenA != _tokenB, "Tokens must be different");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external returns (uint256 liquidityMinted) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        require(tokenA.transferFrom(msg.sender, address(this), amountA), "Transfer A failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "Transfer B failed");

        if (totalLiquidity == 0) {
            liquidityMinted = _sqrt(amountA * amountB);
        } else {
            uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
            uint256 liquidityB = (amountB * totalLiquidity) / reserveB;
            liquidityMinted = _min(liquidityA, liquidityB);
        }

        require(liquidityMinted > 0, "Zero liquidity minted");

        liquidityOf[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
    }

    function removeLiquidity(
        uint256 liquidityAmount
    ) external returns (uint256 amountA, uint256 amountB) {
        require(liquidityAmount > 0, "Invalid liquidity");
        require(liquidityOf[msg.sender] >= liquidityAmount, "Not enough liquidity");

        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        liquidityOf[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;

        reserveA -= amountA;
        reserveB -= amountB;

        require(tokenA.transfer(msg.sender, amountA), "Transfer A failed");
        require(tokenB.transfer(msg.sender, amountB), "Transfer B failed");

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
    }

    function swapExactTokenAForTokenB(
        uint256 amountAIn,
        uint256 minAmountBOut
    ) external returns (uint256 amountBOut) {
        require(amountAIn > 0, "Invalid input");
        require(reserveA > 0 && reserveB > 0, "Empty pool");

        require(tokenA.transferFrom(msg.sender, address(this), amountAIn), "Transfer A failed");

        uint256 amountInWithFee = (amountAIn * 997) / 1000;
        amountBOut = (amountInWithFee * reserveB) / (reserveA + amountInWithFee);

        require(amountBOut > 0, "Zero output");
        require(amountBOut >= minAmountBOut, "Slippage too high");
        require(amountBOut < reserveB, "Not enough liquidity");

        reserveA += amountAIn;
        reserveB -= amountBOut;

        require(tokenB.transfer(msg.sender, amountBOut), "Transfer B failed");

        emit Swapped(msg.sender, address(tokenA), amountAIn, address(tokenB), amountBOut);
    }

    function swapExactTokenBForTokenA(
        uint256 amountBIn,
        uint256 minAmountAOut
    ) external returns (uint256 amountAOut) {
        require(amountBIn > 0, "Invalid input");
        require(reserveA > 0 && reserveB > 0, "Empty pool");

        require(tokenB.transferFrom(msg.sender, address(this), amountBIn), "Transfer B failed");

        uint256 amountInWithFee = (amountBIn * 997) / 1000;
        amountAOut = (amountInWithFee * reserveA) / (reserveB + amountInWithFee);

        require(amountAOut > 0, "Zero output");
        require(amountAOut >= minAmountAOut, "Slippage too high");
        require(amountAOut < reserveA, "Not enough liquidity");

        reserveB += amountBIn;
        reserveA -= amountAOut;

        require(tokenA.transfer(msg.sender, amountAOut), "Transfer A failed");

        emit Swapped(msg.sender, address(tokenB), amountBIn, address(tokenA), amountAOut);
    }

    function _min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x <= y ? x : y;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}