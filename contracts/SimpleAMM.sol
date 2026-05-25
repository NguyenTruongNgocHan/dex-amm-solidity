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

    uint8 public constant PARTICIPANT_NONE = 0;
    uint8 public constant PARTICIPANT_PENDING = 1;
    uint8 public constant PARTICIPANT_APPROVED = 2;
    uint8 public constant PARTICIPANT_REJECTED = 3;

    uint8 public constant EVIDENCE_TRADE_RECEIPT = 1;
    uint8 public constant EVIDENCE_LIQUIDITY_RECEIPT = 2;
    uint8 public constant EVIDENCE_POOL_AUDIT_REPORT = 3;
    uint8 public constant EVIDENCE_GOVERNANCE_PROPOSAL = 4;

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
    bool public liquidityProviderApprovalRequired = false;

    mapping(address => bool) public whitelistedTokens;

    struct ParticipantProfile {
        uint8 status;
        bytes32 profileHash;
        string evidenceURI;
        uint256 requestedAt;
        uint256 reviewedAt;
        address reviewer;
    }

    struct EvidenceRecord {
        uint8 evidenceType;
        bytes32 contentHash;
        string evidenceURI;
        address submitter;
        uint256 submittedAt;
    }

    mapping(address => ParticipantProfile) private participantProfiles;
    mapping(bytes32 => EvidenceRecord) private evidenceRecords;

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

    event TokenWhitelistUpdated(
        address indexed operator,
        address indexed token,
        bool whitelisted
    );

    event LiquidityProviderPolicyUpdated(
        address indexed operator,
        bool approvalRequired
    );

    event ParticipantRequested(
        address indexed participant,
        bytes32 indexed profileHash,
        string evidenceURI
    );

    event ParticipantReviewed(
        address indexed participant,
        uint8 status,
        address indexed reviewer,
        string evidenceURI
    );

    event AuditNoteSubmitted(
        address indexed auditor,
        bytes32 indexed subject,
        string noteURI
    );

    event EvidenceAnchored(
        bytes32 indexed subject,
        uint8 indexed evidenceType,
        bytes32 indexed contentHash,
        string evidenceURI,
        address submitter,
        uint256 submittedAt
    );

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "Invalid token A");
        require(_tokenB != address(0), "Invalid token B");
        require(_tokenA != _tokenB, "Tokens must be different");

        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        lpToken = new LPToken();

        whitelistedTokens[_tokenA] = true;
        whitelistedTokens[_tokenB] = true;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);

        emit TokenWhitelistUpdated(msg.sender, _tokenA, true);
        emit TokenWhitelistUpdated(msg.sender, _tokenB, true);
    }

    modifier ensureDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, "Transaction expired");
        _;
    }

    modifier whenTradingEnabled() {
        require(tradingEnabled, "Trading disabled");
        _;
    }

    modifier onlyWhitelistedPair() {
        require(whitelistedTokens[address(tokenA)], "Token A not whitelisted");
        require(whitelistedTokens[address(tokenB)], "Token B not whitelisted");
        _;
    }

    modifier onlyApprovedLiquidityProvider() {
        if (liquidityProviderApprovalRequired) {
            require(
                participantProfiles[msg.sender].status == PARTICIPANT_APPROVED,
                "LP approval required"
            );
        }
        _;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setTradingEnabled(bool enabled) external onlyRole(OPERATOR_ROLE) {
        tradingEnabled = enabled;
        emit TradingStatusChanged(msg.sender, enabled);
    }

    function setTokenWhitelist(
        address token,
        bool whitelisted
    ) external onlyRole(OPERATOR_ROLE) {
        require(token != address(0), "Invalid token");
        require(
            token == address(tokenA) || token == address(tokenB),
            "Unsupported pool token"
        );

        whitelistedTokens[token] = whitelisted;

        emit TokenWhitelistUpdated(msg.sender, token, whitelisted);
    }

    function setLiquidityProviderApprovalRequired(
        bool required
    ) external onlyRole(OPERATOR_ROLE) {
        liquidityProviderApprovalRequired = required;

        emit LiquidityProviderPolicyUpdated(msg.sender, required);
    }

    function requestLiquidityProviderApproval(
        bytes32 profileHash,
        string calldata evidenceURI
    ) external {
        require(profileHash != bytes32(0), "Invalid profile hash");
        require(bytes(evidenceURI).length > 0, "Invalid evidence URI");

        ParticipantProfile storage profile = participantProfiles[msg.sender];

        require(
            profile.status == PARTICIPANT_NONE ||
                profile.status == PARTICIPANT_REJECTED,
            "Request already active"
        );

        profile.status = PARTICIPANT_PENDING;
        profile.profileHash = profileHash;
        profile.evidenceURI = evidenceURI;
        profile.requestedAt = block.timestamp;
        profile.reviewedAt = 0;
        profile.reviewer = address(0);

        emit ParticipantRequested(msg.sender, profileHash, evidenceURI);
    }

    function reviewLiquidityProvider(
        address participant,
        bool approved,
        string calldata reviewEvidenceURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(participant != address(0), "Invalid participant");

        ParticipantProfile storage profile = participantProfiles[participant];

        require(profile.status == PARTICIPANT_PENDING, "No pending request");

        profile.status = approved
            ? PARTICIPANT_APPROVED
            : PARTICIPANT_REJECTED;
        profile.reviewedAt = block.timestamp;
        profile.reviewer = msg.sender;

        if (bytes(reviewEvidenceURI).length > 0) {
            profile.evidenceURI = reviewEvidenceURI;
        }

        emit ParticipantReviewed(
            participant,
            profile.status,
            msg.sender,
            profile.evidenceURI
        );
    }

    function submitAuditNote(
        bytes32 subject,
        string calldata noteURI
    ) external onlyRole(AUDITOR_ROLE) {
        require(subject != bytes32(0), "Invalid subject");
        require(bytes(noteURI).length > 0, "Invalid note URI");

        emit AuditNoteSubmitted(msg.sender, subject, noteURI);
    }

    function submitEvidence(
        bytes32 subject,
        uint8 evidenceType,
        bytes32 contentHash,
        string calldata evidenceURI
    ) external whenNotPaused {
        require(subject != bytes32(0), "Invalid subject");
        require(contentHash != bytes32(0), "Invalid content hash");
        require(bytes(evidenceURI).length > 0, "Invalid evidence URI");
        require(evidenceType >= 1 && evidenceType <= 4, "Invalid evidence type");
        require(evidenceRecords[subject].submittedAt == 0, "Evidence exists");

        evidenceRecords[subject] = EvidenceRecord({
            evidenceType: evidenceType,
            contentHash: contentHash,
            evidenceURI: evidenceURI,
            submitter: msg.sender,
            submittedAt: block.timestamp
        });

        emit EvidenceAnchored(
            subject,
            evidenceType,
            contentHash,
            evidenceURI,
            msg.sender,
            block.timestamp
        );
    }

    function getEvidence(
        bytes32 subject
    )
        external
        view
        returns (
            uint8 evidenceType,
            bytes32 contentHash,
            string memory evidenceURI,
            address submitter,
            uint256 submittedAt
        )
    {
        EvidenceRecord memory record = evidenceRecords[subject];

        return (
            record.evidenceType,
            record.contentHash,
            record.evidenceURI,
            record.submitter,
            record.submittedAt
        );
    }

    function getParticipantProfile(
        address account
    )
        external
        view
        returns (
            uint8 status,
            bytes32 profileHash,
            string memory evidenceURI,
            uint256 requestedAt,
            uint256 reviewedAt,
            address reviewer
        )
    {
        ParticipantProfile memory profile = participantProfiles[account];

        return (
            profile.status,
            profile.profileHash,
            profile.evidenceURI,
            profile.requestedAt,
            profile.reviewedAt,
            profile.reviewer
        );
    }

    function getProductionPolicy()
        external
        view
        returns (
            bool isPaused,
            bool isTradingEnabled,
            bool isTokenAWhitelisted,
            bool isTokenBWhitelisted,
            bool isLpApprovalRequired
        )
    {
        return (
            paused(),
            tradingEnabled,
            whitelistedTokens[address(tokenA)],
            whitelistedTokens[address(tokenB)],
            liquidityProviderApprovalRequired
        );
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
            bool isTradingEnabled,
            bool isLpApprovalRequired,
            uint8 participantStatus
        )
    {
        return (
            hasRole(DEFAULT_ADMIN_ROLE, account),
            hasRole(OPERATOR_ROLE, account),
            hasRole(AUDITOR_ROLE, account),
            paused(),
            tradingEnabled,
            liquidityProviderApprovalRequired,
            participantProfiles[account].status
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
        onlyWhitelistedPair
        onlyApprovedLiquidityProvider
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
        onlyWhitelistedPair
        onlyApprovedLiquidityProvider
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
        onlyWhitelistedPair
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
        onlyWhitelistedPair
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
        onlyWhitelistedPair
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
        onlyWhitelistedPair
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
        onlyWhitelistedPair
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
        onlyWhitelistedPair
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
        require(
            lpToken.balanceOf(msg.sender) >= liquidityAmount,
            "Not enough LP"
        );

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

        bool isAtoB = tokenIn == address(tokenA);
        require(isAtoB || tokenIn == address(tokenB), "Unsupported token");

        IERC20 inputToken = isAtoB ? tokenA : tokenB;
        IERC20 outputToken = isAtoB ? tokenB : tokenA;

        uint256 reserveIn = isAtoB ? reserveA : reserveB;
        uint256 reserveOut = isAtoB ? reserveB : reserveA;

        amountOut = getAmountOut(tokenIn, amountIn);

        require(amountOut >= minAmountOut, "Slippage too high");
        require(amountOut < reserveOut, "Insufficient liquidity");

        inputToken.safeTransferFrom(msg.sender, address(this), amountIn);
        outputToken.safeTransfer(msg.sender, amountOut);

        reserveIn += amountIn;
        reserveOut -= amountOut;

        if (isAtoB) {
            reserveA = reserveIn;
            reserveB = reserveOut;
        } else {
            reserveB = reserveIn;
            reserveA = reserveOut;
        }

        emit Swapped(
            msg.sender,
            tokenIn,
            amountIn,
            address(outputToken),
            amountOut
        );
    }

    function _sqrt(uint256 x) private pure returns (uint256 y) {
        if (x == 0) return 0;

        uint256 z = (x + 1) / 2;
        y = x;

        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}