import { expect } from "chai";
import hre from "hardhat";

describe("StakingRewards", function () {
  this.timeout(120000);

  const REWARD_DURATION = 7 * 24 * 60 * 60;

  let ethers;
  let owner;
  let alice;
  let bob;

  let tokenA;
  let tokenB;
  let amm;
  let lpToken;
  let rewardToken;
  let stakingRewards;

  const toWei = (value) => ethers.parseUnits(value, 18);

  async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  async function stakeAllAliceLP() {
    const lpBalance = await lpToken.balanceOf(alice.address);

    await lpToken.connect(alice).approve(
      await stakingRewards.getAddress(),
      lpBalance
    );

    await stakingRewards.connect(alice).stake(lpBalance);

    return lpBalance;
  }

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [owner, alice, bob] = await ethers.getSigners();

    tokenA = await ethers.deployContract("MockERC20", [
      "Token A",
      "TKA",
      toWei("1000000"),
    ]);

    tokenB = await ethers.deployContract("MockERC20", [
      "Token B",
      "TKB",
      toWei("1000000"),
    ]);

    amm = await ethers.deployContract("SimpleAMM", [
      await tokenA.getAddress(),
      await tokenB.getAddress(),
    ]);

    const lpTokenAddress = await amm.lpToken();
    lpToken = await ethers.getContractAt("LPToken", lpTokenAddress);

    rewardToken = await ethers.deployContract("DEXRewardToken");

    stakingRewards = await ethers.deployContract("StakingRewards", [
      lpTokenAddress,
      await rewardToken.getAddress(),
      REWARD_DURATION,
    ]);

    await tokenA.transfer(alice.address, toWei("10000"));
    await tokenB.transfer(alice.address, toWei("10000"));

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("1000"));

    await amm.connect(alice).addLiquidity(toWei("1000"), toWei("1000"));

    await rewardToken.mint(await stakingRewards.getAddress(), toWei("50000"));
    await stakingRewards.notifyRewardAmount(toWei("50000"));
  });

  it("should deploy with correct staking token and reward token", async function () {
    expect(await stakingRewards.stakingToken()).to.equal(
      await lpToken.getAddress()
    );
    expect(await stakingRewards.rewardToken()).to.equal(
      await rewardToken.getAddress()
    );
    expect(await stakingRewards.duration()).to.equal(REWARD_DURATION);
  });

  it("should allow user to stake LP tokens", async function () {
    const lpBalance = await lpToken.balanceOf(alice.address);

    await lpToken.connect(alice).approve(
      await stakingRewards.getAddress(),
      lpBalance
    );

    await expect(stakingRewards.connect(alice).stake(lpBalance))
      .to.emit(stakingRewards, "Staked")
      .withArgs(alice.address, lpBalance);

    expect(await stakingRewards.balanceOf(alice.address)).to.equal(lpBalance);
    expect(await stakingRewards.totalSupply()).to.equal(lpBalance);
    expect(await lpToken.balanceOf(alice.address)).to.equal(0n);
  });

  it("should calculate earned rewards over time", async function () {
    await stakeAllAliceLP();

    await increaseTime(3600);

    expect(await stakingRewards.earned(alice.address)).to.be.greaterThan(0n);
  });

  it("should allow user to claim DRX rewards", async function () {
    await stakeAllAliceLP();

    await increaseTime(3600);

    await expect(stakingRewards.connect(alice).claimReward()).to.emit(
      stakingRewards,
      "RewardPaid"
    );

    expect(await rewardToken.balanceOf(alice.address)).to.be.greaterThan(0n);
    expect(await stakingRewards.earned(alice.address)).to.equal(0n);
  });

  it("should allow user to withdraw staked LP tokens", async function () {
    const lpBalance = await lpToken.balanceOf(alice.address);
    const stakeAmount = lpBalance / 2n;

    await lpToken.connect(alice).approve(
      await stakingRewards.getAddress(),
      stakeAmount
    );

    await stakingRewards.connect(alice).stake(stakeAmount);

    await expect(stakingRewards.connect(alice).withdraw(stakeAmount))
      .to.emit(stakingRewards, "Withdrawn")
      .withArgs(alice.address, stakeAmount);

    expect(await stakingRewards.balanceOf(alice.address)).to.equal(0n);
    expect(await stakingRewards.totalSupply()).to.equal(0n);
    expect(await lpToken.balanceOf(alice.address)).to.equal(lpBalance);
  });

  it("should allow user to exit farm with rewards", async function () {
    const lpBalance = await stakeAllAliceLP();

    await increaseTime(3600);

    await expect(stakingRewards.connect(alice).exit()).to.emit(
      stakingRewards,
      "RewardPaid"
    );

    expect(await stakingRewards.balanceOf(alice.address)).to.equal(0n);
    expect(await lpToken.balanceOf(alice.address)).to.equal(lpBalance);
    expect(await rewardToken.balanceOf(alice.address)).to.be.greaterThan(0n);
  });

  it("should allow user to exit farm immediately without reverting", async function () {
    const lpBalance = await stakeAllAliceLP();

    await expect(stakingRewards.connect(alice).exit())
      .to.emit(stakingRewards, "Withdrawn")
      .withArgs(alice.address, lpBalance);

    expect(await stakingRewards.balanceOf(alice.address)).to.equal(0n);
    expect(await stakingRewards.totalSupply()).to.equal(0n);
    expect(await lpToken.balanceOf(alice.address)).to.equal(lpBalance);
  });

  it("should revert when exiting without staked balance", async function () {
    await expect(stakingRewards.connect(alice).exit()).to.be.revertedWith(
      "No staked balance"
    );
  });

  it("should revert when staking zero amount", async function () {
    await expect(stakingRewards.connect(alice).stake(0)).to.be.revertedWith(
      "Cannot stake 0"
    );
  });

  it("should revert when withdrawing zero amount", async function () {
    await expect(stakingRewards.connect(alice).withdraw(0)).to.be.revertedWith(
      "Cannot withdraw 0"
    );
  });

  it("should revert when withdrawing more than staked balance", async function () {
    await expect(
      stakingRewards.connect(alice).withdraw(toWei("1"))
    ).to.be.revertedWith("Not enough staked");
  });

  it("should revert when claiming without rewards", async function () {
    await expect(
      stakingRewards.connect(alice).claimReward()
    ).to.be.revertedWith("No reward");
  });

  it("should only allow owner to notify reward amount", async function () {
    await expect(
      stakingRewards.connect(bob).notifyRewardAmount(toWei("1000"))
    )
      .to.be.revertedWithCustomError(
        stakingRewards,
        "OwnableUnauthorizedAccount"
      )
      .withArgs(bob.address);
  });
});