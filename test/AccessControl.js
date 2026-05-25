import { expect } from "chai";
import hre from "hardhat";

describe("Production Access Control", function () {
  let ethers;
  let admin;
  let operator;
  let auditor;
  let trader;
  let tokenA;
  let tokenB;
  let amm;
  let lpToken;
  let rewardToken;
  let stakingRewards;

  const REWARD_DURATION = 7 * 24 * 60 * 60;
  const toWei = (value) => ethers.parseUnits(value, 18);

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [admin, operator, auditor, trader] = await ethers.getSigners();

    tokenA = await ethers.deployContract("MockERC20", [
      "Demo Token A",
      "DTA",
      toWei("1000000"),
    ]);

    tokenB = await ethers.deployContract("MockERC20", [
      "Demo Token B",
      "DTB",
      toWei("1000000"),
    ]);

    amm = await ethers.deployContract("SimpleAMM", [
      await tokenA.getAddress(),
      await tokenB.getAddress(),
    ]);

    lpToken = await ethers.getContractAt("LPToken", await amm.lpToken());

    rewardToken = await ethers.deployContract("DEXRewardToken");

    stakingRewards = await ethers.deployContract("StakingRewards", [
      await lpToken.getAddress(),
      await rewardToken.getAddress(),
      REWARD_DURATION,
    ]);

    await tokenA.transfer(trader.address, toWei("10000"));
    await tokenB.transfer(trader.address, toWei("10000"));

    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));
    await amm.addLiquidity(toWei("1000"), toWei("1000"));
  });

  it("should assign admin, operator, and auditor roles to deployer by default", async function () {
    const [isAdmin, isOperator, isAuditor, isPaused, isTradingEnabled] =
      await amm.getRoleSummary(admin.address);

    expect(isAdmin).to.equal(true);
    expect(isOperator).to.equal(true);
    expect(isAuditor).to.equal(true);
    expect(isPaused).to.equal(false);
    expect(isTradingEnabled).to.equal(true);
  });

  it("should allow admin to grant operator and auditor roles", async function () {
    const operatorRole = await amm.OPERATOR_ROLE();
    const auditorRole = await amm.AUDITOR_ROLE();

    await expect(amm.grantRole(operatorRole, operator.address)).to.emit(
      amm,
      "RoleGranted"
    );

    await expect(amm.grantRole(auditorRole, auditor.address)).to.emit(
      amm,
      "RoleGranted"
    );

    expect(await amm.hasRole(operatorRole, operator.address)).to.equal(true);
    expect(await amm.hasRole(auditorRole, auditor.address)).to.equal(true);
  });

  it("should reject normal trader when changing trading status", async function () {
    await expect(
      amm.connect(trader).setTradingEnabled(false)
    ).to.be.revertedWithCustomError(
      amm,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("should allow operator to disable trading and block user swaps", async function () {
    const operatorRole = await amm.OPERATOR_ROLE();

    await amm.grantRole(operatorRole, operator.address);

    await expect(amm.connect(operator).setTradingEnabled(false))
      .to.emit(amm, "TradingStatusChanged")
      .withArgs(operator.address, false);

    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.be.revertedWith("Trading disabled");
  });

  it("should allow admin to pause and unpause the AMM", async function () {
    await amm.pause();

    expect(await amm.paused()).to.equal(true);

    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.be.revertedWithCustomError(amm, "EnforcedPause");

    await amm.unpause();

    expect(await amm.paused()).to.equal(false);
  });

  it("should reject operator from granting roles because only admin can manage roles", async function () {
    const operatorRole = await amm.OPERATOR_ROLE();
    const auditorRole = await amm.AUDITOR_ROLE();

    await amm.grantRole(operatorRole, operator.address);

    await expect(
      amm.connect(operator).grantRole(auditorRole, trader.address)
    ).to.be.revertedWithCustomError(
      amm,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("should allow auditor to submit audit note", async function () {
    const auditorRole = await amm.AUDITOR_ROLE();
    const subject = ethers.keccak256(
      ethers.toUtf8Bytes("pool-risk-report-001")
    );

    await amm.grantRole(auditorRole, auditor.address);

    await expect(
      amm
        .connect(auditor)
        .submitAuditNote(subject, "ipfs://bafy-demo-pool-risk-report")
    )
      .to.emit(amm, "AuditNoteSubmitted")
      .withArgs(auditor.address, subject, "ipfs://bafy-demo-pool-risk-report");
  });

  it("should reject normal trader from submitting audit note", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("fake-audit-note"));

    await expect(
      amm.connect(trader).submitAuditNote(subject, "ipfs://fake")
    ).to.be.revertedWithCustomError(
      amm,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("should require operator role to notify staking rewards", async function () {
    await rewardToken.mint(await stakingRewards.getAddress(), toWei("1000"));

    await expect(
      stakingRewards.connect(trader).notifyRewardAmount(toWei("1000"))
    ).to.be.revertedWithCustomError(
      stakingRewards,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("should allow staking operator to notify rewards", async function () {
    const operatorRole = await stakingRewards.OPERATOR_ROLE();

    await stakingRewards.grantRole(operatorRole, operator.address);
    await rewardToken.mint(await stakingRewards.getAddress(), toWei("1000"));

    await expect(
      stakingRewards.connect(operator).notifyRewardAmount(toWei("1000"))
    ).to.emit(stakingRewards, "RewardAdded");
  });
});