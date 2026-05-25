import { expect } from "chai";
import hre from "hardhat";

describe("Production Policy Layer", function () {
  let ethers;
  let admin;
  let operator;
  let auditor;
  let lpCandidate;
  let trader;
  let tokenA;
  let tokenB;
  let amm;

  const toWei = (value) => ethers.parseUnits(value, 18);

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [admin, operator, auditor, lpCandidate, trader] = await ethers.getSigners();

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

    await tokenA.transfer(lpCandidate.address, toWei("10000"));
    await tokenB.transfer(lpCandidate.address, toWei("10000"));
    await tokenA.transfer(trader.address, toWei("10000"));
    await tokenB.transfer(trader.address, toWei("10000"));

    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));
    await amm.addLiquidity(toWei("1000"), toWei("1000"));

    const operatorRole = await amm.OPERATOR_ROLE();
    const auditorRole = await amm.AUDITOR_ROLE();

    await amm.grantRole(operatorRole, operator.address);
    await amm.grantRole(auditorRole, auditor.address);
  });

  it("should whitelist pool tokens by default", async function () {
    const policy = await amm.getProductionPolicy();

    expect(policy.isTokenAWhitelisted).to.equal(true);
    expect(policy.isTokenBWhitelisted).to.equal(true);
  });

  it("should only allow operator to update token whitelist", async function () {
    await expect(
      amm.connect(trader).setTokenWhitelist(await tokenA.getAddress(), false)
    ).to.be.revertedWithCustomError(
      amm,
      "AccessControlUnauthorizedAccount"
    );

    await expect(
      amm.connect(operator).setTokenWhitelist(await tokenA.getAddress(), false)
    )
      .to.emit(amm, "TokenWhitelistUpdated")
      .withArgs(operator.address, await tokenA.getAddress(), false);
  });

  it("should block swap when a pool token is not whitelisted", async function () {
    await amm.connect(operator).setTokenWhitelist(await tokenA.getAddress(), false);

    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.be.revertedWith("Token A not whitelisted");
  });

  it("should keep swap permissionless when pool tokens are whitelisted", async function () {
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.emit(amm, "Swapped");
  });

  it("should allow operator to require verified LP approval", async function () {
    await expect(
      amm.connect(operator).setLiquidityProviderApprovalRequired(true)
    )
      .to.emit(amm, "LiquidityProviderPolicyUpdated")
      .withArgs(operator.address, true);

    const policy = await amm.getProductionPolicy();

    expect(policy.isLpApprovalRequired).to.equal(true);
  });

  it("should block add liquidity when LP approval is required and user is not approved", async function () {
    await amm.connect(operator).setLiquidityProviderApprovalRequired(true);

    await tokenA.connect(lpCandidate).approve(await amm.getAddress(), toWei("100"));
    await tokenB.connect(lpCandidate).approve(await amm.getAddress(), toWei("100"));

    await expect(
      amm.connect(lpCandidate).addLiquidity(toWei("100"), toWei("100"))
    ).to.be.revertedWith("LP approval required");
  });

  it("should allow candidate to request verified LP approval", async function () {
    const profileHash = ethers.keccak256(
      ethers.toUtf8Bytes("lp-profile-hash-demo")
    );

    await expect(
      amm
        .connect(lpCandidate)
        .requestLiquidityProviderApproval(
          profileHash,
          "ipfs://lp-evidence-demo"
        )
    )
      .to.emit(amm, "ParticipantRequested")
      .withArgs(lpCandidate.address, profileHash, "ipfs://lp-evidence-demo");

    const profile = await amm.getParticipantProfile(lpCandidate.address);

    expect(profile.status).to.equal(1n);
    expect(profile.profileHash).to.equal(profileHash);
  });

  it("should allow admin to approve verified LP and then add liquidity", async function () {
    await amm.connect(operator).setLiquidityProviderApprovalRequired(true);

    const profileHash = ethers.keccak256(
      ethers.toUtf8Bytes("verified-lp-profile")
    );

    await amm
      .connect(lpCandidate)
      .requestLiquidityProviderApproval(
        profileHash,
        "ipfs://lp-evidence-before-review"
      );

    await expect(
      amm
        .connect(admin)
        .reviewLiquidityProvider(
          lpCandidate.address,
          true,
          "ipfs://lp-evidence-approved"
        )
    )
      .to.emit(amm, "ParticipantReviewed")
      .withArgs(lpCandidate.address, 2, admin.address, "ipfs://lp-evidence-approved");

    await tokenA.connect(lpCandidate).approve(await amm.getAddress(), toWei("100"));
    await tokenB.connect(lpCandidate).approve(await amm.getAddress(), toWei("100"));

    await expect(
      amm.connect(lpCandidate).addLiquidity(toWei("100"), toWei("100"))
    ).to.emit(amm, "LiquidityAdded");
  });

  it("should allow admin to reject verified LP request", async function () {
    const profileHash = ethers.keccak256(
      ethers.toUtf8Bytes("bad-lp-profile")
    );

    await amm
      .connect(lpCandidate)
      .requestLiquidityProviderApproval(profileHash, "ipfs://bad-evidence");

    await expect(
      amm
        .connect(admin)
        .reviewLiquidityProvider(
          lpCandidate.address,
          false,
          "ipfs://rejection-note"
        )
    )
      .to.emit(amm, "ParticipantReviewed")
      .withArgs(lpCandidate.address, 3, admin.address, "ipfs://rejection-note");

    const profile = await amm.getParticipantProfile(lpCandidate.address);

    expect(profile.status).to.equal(3n);
  });
});