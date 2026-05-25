import { expect } from "chai";
import hre from "hardhat";

describe("On-chain Evidence Anchoring", function () {
  let ethers;
  let owner;
  let trader;
  let tokenA;
  let tokenB;
  let amm;

  const toWei = (value) => ethers.parseUnits(value, 18);

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [owner, trader] = await ethers.getSigners();

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

    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));
    await amm.addLiquidity(toWei("1000"), toWei("1000"));

    await tokenA.transfer(trader.address, toWei("100"));
  });

  it("should anchor IPFS receipt hash to a successful swap transaction", async function () {
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    const swapTx = await amm
      .connect(trader)
      .swapExactTokenAForTokenB(toWei("10"), 1);

    await swapTx.wait();

    const subject = swapTx.hash;
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("trade-receipt-json-content")
    );
    const evidenceURI = "ipfs://bafy-demo-trade-receipt";

    await expect(
      amm
        .connect(trader)
        .submitEvidence(subject, 1, contentHash, evidenceURI)
    )
      .to.emit(amm, "EvidenceAnchored")
      .withArgs(
        subject,
        1,
        contentHash,
        evidenceURI,
        trader.address,
        await timeMatcher()
      );

    const record = await amm.getEvidence(subject);

    expect(record.evidenceType).to.equal(1);
    expect(record.contentHash).to.equal(contentHash);
    expect(record.evidenceURI).to.equal(evidenceURI);
    expect(record.submitter).to.equal(trader.address);
    expect(record.submittedAt).to.be.greaterThan(0n);
  });

  it("should reject duplicated evidence for the same subject", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("tx-hash-demo"));
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-v1"));

    await amm.submitEvidence(
      subject,
      1,
      contentHash,
      "ipfs://bafy-demo-receipt"
    );

    await expect(
      amm.submitEvidence(
        subject,
        1,
        contentHash,
        "ipfs://bafy-demo-receipt-duplicate"
      )
    ).to.be.revertedWith("Evidence exists");
  });

  it("should reject invalid evidence payload", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("tx-hash-demo"));
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-v1"));

    await expect(
      amm.submitEvidence(ethers.ZeroHash, 1, contentHash, "ipfs://demo")
    ).to.be.revertedWith("Invalid subject");

    await expect(
      amm.submitEvidence(subject, 0, contentHash, "ipfs://demo")
    ).to.be.revertedWith("Invalid evidence type");

    await expect(
      amm.submitEvidence(subject, 1, ethers.ZeroHash, "ipfs://demo")
    ).to.be.revertedWith("Invalid content hash");

    await expect(
      amm.submitEvidence(subject, 1, contentHash, "")
    ).to.be.revertedWith("Invalid evidence URI");
  });

  it("should block evidence anchoring while protocol is paused", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("tx-hash-demo"));
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-v1"));

    await amm.pause();

    await expect(
      amm.submitEvidence(subject, 1, contentHash, "ipfs://demo")
    ).to.be.revertedWithCustomError(amm, "EnforcedPause");
  });
});

async function timeMatcher() {
  return (value) => value > 0n;
}