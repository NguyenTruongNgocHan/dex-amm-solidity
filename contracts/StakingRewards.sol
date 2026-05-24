// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingRewards is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public duration;
    uint256 public finishAt;
    uint256 public updatedAt;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward);
    event DurationUpdated(uint256 duration);

    event AuditNoteSubmitted(
        address indexed auditor,
        bytes32 indexed subject,
        string noteURI
    );

    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _duration
    ) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        require(_duration > 0, "Invalid duration");

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        duration = _duration;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }

        _;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
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
            bool isPaused
        )
    {
        return (
            hasRole(DEFAULT_ADMIN_ROLE, account),
            hasRole(OPERATOR_ROLE, account),
            hasRole(AUDITOR_ROLE, account),
            paused()
        );
    }

    function setDuration(
        uint256 _duration
    ) external onlyRole(OPERATOR_ROLE) {
        require(_duration > 0, "Invalid duration");
        require(block.timestamp > finishAt, "Reward period active");

        duration = _duration;

        emit DurationUpdated(_duration);
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < finishAt ? block.timestamp : finishAt;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            ((lastTimeRewardApplicable() - updatedAt) * rewardRate * 1e18) /
            totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return
            ((balanceOf[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    function stake(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");

        totalSupply += amount;
        balanceOf[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function withdraw(
        uint256 amount
    ) public nonReentrant whenNotPaused updateReward(msg.sender) {
        _withdraw(msg.sender, amount);
    }

    function claimReward()
        public
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {
        _claimReward(msg.sender);
    }

    function exit() external nonReentrant whenNotPaused updateReward(msg.sender) {
        uint256 stakedAmount = balanceOf[msg.sender];

        require(stakedAmount > 0, "No staked balance");

        _withdraw(msg.sender, stakedAmount);

        uint256 reward = rewards[msg.sender];

        if (reward > 0) {
            _claimReward(msg.sender);
        }
    }

    function notifyRewardAmount(
        uint256 amount
    )
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
        updateReward(address(0))
    {
        require(amount > 0, "Invalid reward amount");

        if (block.timestamp >= finishAt) {
            rewardRate = amount / duration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) *
                rewardRate;

            rewardRate = (amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "Reward rate is zero");
        require(
            rewardRate * duration <= rewardToken.balanceOf(address(this)),
            "Insufficient reward balance"
        );

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;

        emit RewardAdded(amount);
    }

    function _withdraw(address account, uint256 amount) private {
        require(amount > 0, "Cannot withdraw 0");
        require(balanceOf[account] >= amount, "Not enough staked");

        totalSupply -= amount;
        balanceOf[account] -= amount;

        stakingToken.safeTransfer(account, amount);

        emit Withdrawn(account, amount);
    }

    function _claimReward(address account) private {
        uint256 reward = rewards[account];

        require(reward > 0, "No reward");

        rewards[account] = 0;
        rewardToken.safeTransfer(account, reward);

        emit RewardPaid(account, reward);
    }
}