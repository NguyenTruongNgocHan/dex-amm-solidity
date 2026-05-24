// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LPToken.sol";

contract SimpleAMM is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    uint256 public constant FEE_NUMERATOR = 997;
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant PRICE_PRECISION = 1e18;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    LPToken public immutable lpToken;

    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;

    bool public tradingEnabled = true;

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

    event TradingStatusChanged(address indexed operator, bool enabled);

    event AuditNoteSubmitted(
        address indexed auditor,
        bytes32 indexed subject,
        string noteURI
    );

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "Invalid token A");
        require(_tokenB != address(0), "Invalid token B");
        require(_tokenA != _tokenB, "Tokens must be different");

        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        lpToken = new LPToken();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    modifier ensureDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, "Transaction expired");
        _;
    }

    modifier whenTradingEnabled() {
        require(tradingEnabled, "Trading disabled");
        _;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setTradingEnabled(
        bool enabled
    ) external onlyRole(OPERATOR_ROLE) {
        tradingEnabled = enabled;
        emit TradingStatusChanged(msg.sender, enabled);
    }

    function submitAuditNote(
        bytes32 subject,
        string calldata noteURI
    ) external onlyRole(AUDITOR_ROLE) {
        require(subject != bytes32(0), "Invalid subject");
        require(bytes(noteURI).length > 0, "Invalid note URI");

        emit AuditNoteSubmitted(msg.sender, subject, noteURI);
    }

    function getRoleSummary(
        address account
    )
        external
        view
        returns (
            bool isAdmin,
            bool isOperator,
            bool isAuditor,
            bool isPaused,
            bool isTradingEnabled
        )
    {
        return (
            hasRole(DEFAULT_ADMIN_ROLE, account),
            hasRole(OPERATOR_ROLE, account),
            hasRole(AUDITOR_ROLE, account),
            paused(),
            tradingEnabled
        );
    }

    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        returns (uint256 liquidityMinted)
    {
        return _addLiquidity(amountADesired, amountBDesired, 0);
    }

    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 minLiquidity,
        uint256 deadline
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        ensureDeadline(deadline)
        returns (uint256 liquidityMinted)
    {
        return _addLiquidity(amountADesired, amountBDesired, minLiquidity);
    }

    function removeLiquidity(
        uint256 liquidityAmount
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        returns (uint256 amountA, uint256 amountB)
    {
        return _removeLiquidity(liquidityAmount, 0, 0);
    }

    function removeLiquidity(
        uint256 liquidityAmount,
        uint256 minAmountA,
        uint256 minAmountB,
        uint256 deadline
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        ensureDeadline(deadline)
        returns (uint256 amountA, uint256 amountB)
    {
        return _removeLiquidity(liquidityAmount, minAmountA, minAmountB);
    }

    function swapExactTokenAForTokenB(
        uint256 amountAIn,
        uint256 minAmountBOut
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        returns (uint256 amountBOut)
    {
        return _swap(address(tokenA), amountAIn, minAmountBOut);
    }

    function swapExactTokenAForTokenB(
        uint256 amountAIn,
        uint256 minAmountBOut,
        uint256 deadline
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        ensureDeadline(deadline)
        returns (uint256 amountBOut)
    {
        return _swap(address(tokenA), amountAIn, minAmountBOut);
    }

    function swapExactTokenBForTokenA(
        uint256 amountBIn,
        uint256 minAmountAOut
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        returns (uint256 amountAOut)
    {
        return _swap(address(tokenB), amountBIn, minAmountAOut);
    }

    function swapExactTokenBForTokenA(
        uint256 amountBIn,
        uint256 minAmountAOut,
        uint256 deadline
    )
        external
        nonReentrant
        whenNotPaused
        whenTradingEnabled
        ensureDeadline(deadline)
        returns (uint256 amountAOut)
    {
        return _swap(address(tokenB), amountBIn, minAmountAOut);
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

        uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) /
            FEE_DENOMINATOR;

        if (tokenIn == address(tokenA)) {
            amountOut =
                (amountInWithFee * reserveB) /
                (reserveA + amountInWithFee);
        } else if (tokenIn == address(tokenB)) {
            amountOut =
                (amountInWithFee * reserveA) /
                (reserveB + amountInWithFee);
        } else {
            revert("Unsupported token");
        }
    }

    function quoteAddLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired
    ) public view returns (uint256 liquidityMinted) {
        (, , liquidityMinted) = quoteAddLiquidityAmounts(
            amountADesired,
            amountBDesired
        );
    }

    function quoteAddLiquidityAmounts(
        uint256 amountADesired,
        uint256 amountBDesired
    )
        public
        view
        returns (
            uint256 amountAUsed,
            uint256 amountBUsed,
            uint256 liquidityMinted
        )
    {
        require(amountADesired > 0 && amountBDesired > 0, "Invalid amounts");

        if (totalLiquidity == 0) {
            amountAUsed = amountADesired;
            amountBUsed = amountBDesired;
            liquidityMinted = _sqrt(amountAUsed * amountBUsed);
            return (amountAUsed, amountBUsed, liquidityMinted);
        }

        uint256 optimalB = (amountADesired * reserveB) / reserveA;

        if (optimalB <= amountBDesired) {
            amountAUsed = amountADesired;
            amountBUsed = optimalB;
        } else {
            uint256 optimalA = (amountBDesired * reserveA) / reserveB;
            amountAUsed = optimalA;
            amountBUsed = amountBDesired;
        }

        uint256 liquidityA = (amountAUsed * totalLiquidity) / reserveA;
        uint256 liquidityB = (amountBUsed * totalLiquidity) / reserveB;

        liquidityMinted = _min(liquidityA, liquidityB);
    }

    function _addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 minLiquidity
    ) private returns (uint256 liquidityMinted) {
        (
            uint256 amountAUsed,
            uint256 amountBUsed,
            uint256 quotedLiquidity
        ) = quoteAddLiquidityAmounts(amountADesired, amountBDesired);

        require(amountAUsed > 0 && amountBUsed > 0, "Zero liquidity amount");
        require(quotedLiquidity > 0, "Zero liquidity minted");
        require(
            quotedLiquidity >= minLiquidity,
            "Insufficient liquidity minted"
        );

        tokenA.safeTransferFrom(msg.sender, address(this), amountAUsed);
        tokenB.safeTransferFrom(msg.sender, address(this), amountBUsed);

        reserveA += amountAUsed;
        reserveB += amountBUsed;
        totalLiquidity += quotedLiquidity;

        lpToken.mint(msg.sender, quotedLiquidity);

        emit LiquidityAdded(
            msg.sender,
            amountAUsed,
            amountBUsed,
            quotedLiquidity
        );

        return quotedLiquidity;
    }

    function _removeLiquidity(
        uint256 liquidityAmount,
        uint256 minAmountA,
        uint256 minAmountB
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
        uint256 minAmountOut
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

            emit Swapped(
                msg.sender,
                address(tokenA),
                amountIn,
                address(tokenB),
                amountOut
            );
        } else if (tokenIn == address(tokenB)) {
            require(amountOut < reserveA, "Not enough liquidity");

            tokenB.safeTransferFrom(msg.sender, address(this), amountIn);

            reserveB += amountIn;
            reserveA -= amountOut;

            tokenA.safeTransfer(msg.sender, amountOut);

            emit Swapped(
                msg.sender,
                address(tokenB),
                amountIn,
                address(tokenA),
                amountOut
            );
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