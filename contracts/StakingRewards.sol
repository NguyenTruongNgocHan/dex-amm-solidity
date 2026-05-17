// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingRewards is Ownable {
    using SafeERC20 for IERC20;

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

    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _duration
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        require(_duration > 0, "Invalid duration");

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        duration = _duration;
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

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");

        totalSupply += amount;
        balanceOf[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balanceOf[msg.sender] >= amount, "Not enough staked");

        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];

        require(reward > 0, "No reward");

        rewards[msg.sender] = 0;
        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardPaid(msg.sender, reward);
    }

    function exit() external {
        uint256 stakedAmount = balanceOf[msg.sender];

        require(stakedAmount > 0, "No staked balance");

        withdraw(stakedAmount);

        uint256 reward = rewards[msg.sender];

        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);

            emit RewardPaid(msg.sender, reward);
        }
    }

    function notifyRewardAmount(
        uint256 amount
    ) external onlyOwner updateReward(address(0)) {
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
}