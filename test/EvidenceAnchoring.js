import { expect } from "chai";
import hre from "hardhat";

describe("On-chain Evidence Anchoring", function () {
  let ethers;
  let owner;
  let trader;
  let operator;
  let auditor;
  let lpCandidate;
  let outsider;
  let tokenA;
  let tokenB;
  let amm;

  const toWei = (value) => ethers.parseUnits(value, 18);

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [owner, trader, operator, auditor, lpCandidate, outsider] =
      await ethers.getSigners();

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

    await amm.grantRole(await amm.OPERATOR_ROLE(), operator.address);
    await amm.grantRole(await amm.AUDITOR_ROLE(), auditor.address);

    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));
    await amm.addLiquidity(toWei("1000"), toWei("1000"));

    await tokenA.transfer(trader.address, toWei("100"));
    await tokenA.transfer(lpCandidate.address, toWei("100"));
    await tokenB.transfer(lpCandidate.address, toWei("100"));
  });

  it("allows any trader to anchor trade receipt evidence", async function () {
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
      amm.connect(trader).submitEvidence(subject, 1, contentHash, evidenceURI)
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

  it("allows operator to anchor governance proposal evidence", async function () {
    const subject = ethers.keccak256(
      ethers.toUtf8Bytes("governance-proposal-001")
    );
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("proposal-json-content")
    );

    await expect(
      amm
        .connect(operator)
        .submitEvidence(
          subject,
          4,
          contentHash,
          "ipfs://bafy-demo-governance-proposal"
        )
    ).to.emit(amm, "EvidenceAnchored");
  });

  it("blocks normal trader from anchoring governance proposal evidence", async function () {
    const subject = ethers.keccak256(
      ethers.toUtf8Bytes("governance-proposal-unauthorized")
    );
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("proposal-json-content")
    );

    await expect(
      amm
        .connect(trader)
        .submitEvidence(
          subject,
          4,
          contentHash,
          "ipfs://bafy-demo-governance-proposal"
        )
    ).to.be.revertedWith("Not allowed for evidence type");
  });

  it("allows auditor to anchor pool audit report evidence", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("audit-report-001"));
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("audit-report-json-content")
    );

    await expect(
      amm
        .connect(auditor)
        .submitEvidence(
          subject,
          3,
          contentHash,
          "ipfs://bafy-demo-audit-report"
        )
    ).to.emit(amm, "EvidenceAnchored");
  });

  it("blocks operator from anchoring pool audit report evidence", async function () {
    const subject = ethers.keccak256(
      ethers.toUtf8Bytes("audit-report-operator-blocked")
    );
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("audit-report-json-content")
    );

    await expect(
      amm
        .connect(operator)
        .submitEvidence(
          subject,
          3,
          contentHash,
          "ipfs://bafy-demo-audit-report"
        )
    ).to.be.revertedWith("Not allowed for evidence type");
  });

  it("allows approved liquidity provider to anchor liquidity receipt evidence", async function () {
    const profileHash = ethers.keccak256(
      ethers.toUtf8Bytes("lp-profile-evidence")
    );

    await amm
      .connect(lpCandidate)
      .requestLiquidityProviderApproval(
        profileHash,
        "ipfs://bafy-demo-lp-request"
      );

    await amm.reviewLiquidityProvider(
      lpCandidate.address,
      true,
      "ipfs://bafy-demo-lp-review"
    );

    const subject = ethers.keccak256(
      ethers.toUtf8Bytes("liquidity-receipt-001")
    );
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("liquidity-json-content")
    );

    await expect(
      amm
        .connect(lpCandidate)
        .submitEvidence(
          subject,
          2,
          contentHash,
          "ipfs://bafy-demo-liquidity-receipt"
        )
    ).to.emit(amm, "EvidenceAnchored");
  });

  it("blocks outsider from anchoring liquidity receipt evidence", async function () {
    const subject = ethers.keccak256(
      ethers.toUtf8Bytes("liquidity-receipt-outsider")
    );
    const contentHash = ethers.keccak256(
      ethers.toUtf8Bytes("liquidity-json-content")
    );

    await expect(
      amm
        .connect(outsider)
        .submitEvidence(
          subject,
          2,
          contentHash,
          "ipfs://bafy-demo-liquidity-receipt"
        )
    ).to.be.revertedWith("Not allowed for evidence type");
  });

  it("allows admin to anchor every evidence type", async function () {
    for (const evidenceType of [1, 2, 3, 4]) {
      const subject = ethers.keccak256(
        ethers.toUtf8Bytes(`admin-evidence-${evidenceType}`)
      );
      const contentHash = ethers.keccak256(
        ethers.toUtf8Bytes(`admin-content-${evidenceType}`)
      );

      await expect(
        amm.submitEvidence(
          subject,
          evidenceType,
          contentHash,
          `ipfs://bafy-demo-admin-${evidenceType}`
        )
      ).to.emit(amm, "EvidenceAnchored");
    }
  });

  it("rejects non-IPFS evidence URI", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("bad-uri"));
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-v1"));

    await expect(
      amm.submitEvidence(subject, 1, contentHash, "https://example.com/file.json")
    ).to.be.revertedWith("Evidence must use IPFS URI");
  });

  it("rejects duplicated evidence for the same subject", async function () {
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

  it("rejects invalid evidence payload", async function () {
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

  it("blocks evidence anchoring while protocol is paused", async function () {
    const subject = ethers.keccak256(ethers.toUtf8Bytes("tx-hash-demo"));
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("receipt-v1"));

    await amm.pause();

    await expect(
      amm.submitEvidence(subject, 1, contentHash, "ipfs://demo")
    ).to.be.revertedWithCustomError(amm, "EnforcedPause");
  });

  it("returns evidence permission summary by account", async function () {
    const traderPermission = await amm.getEvidencePermissionSummary(
      trader.address
    );

    expect(traderPermission.canSubmitTradeReceipt).to.equal(true);
    expect(traderPermission.canSubmitLiquidityReceipt).to.equal(false);
    expect(traderPermission.canSubmitPoolAuditReport).to.equal(false);
    expect(traderPermission.canSubmitGovernanceProposal).to.equal(false);

    const operatorPermission = await amm.getEvidencePermissionSummary(
      operator.address
    );

    expect(operatorPermission.canSubmitTradeReceipt).to.equal(true);
    expect(operatorPermission.canSubmitGovernanceProposal).to.equal(true);

    const auditorPermission = await amm.getEvidencePermissionSummary(
      auditor.address
    );

    expect(auditorPermission.canSubmitTradeReceipt).to.equal(true);
    expect(auditorPermission.canSubmitPoolAuditReport).to.equal(true);
  });
});

async function timeMatcher() {
  return (value) => value > 0n;
}