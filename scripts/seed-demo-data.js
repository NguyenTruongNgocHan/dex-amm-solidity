import hre from "hardhat";
import fs from "fs";
import path from "path";

const { ethers } = await hre.network.create();

const toWei = (value) => ethers.parseUnits(String(value), 18);

function hashJson(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
}

async function safeTx(label, action) {
  try {
    console.log(`\n▶ ${label}`);
    const tx = await action();
    const receipt = await tx.wait();
    console.log(`  Tx: ${tx.hash}`);
    console.log(`  Block: ${receipt.blockNumber}`);
    return { tx, receipt };
  } catch (error) {
    console.log(`  Failed: ${error.shortMessage || error.message}`);
    return null;
  }
}

async function anchorEvidence({ amm, signer, subject, evidenceType, data, uri }) {
  const contentHash = hashJson(data);

  const existing = await amm.getEvidence(subject);

  if (existing.submittedAt && existing.submittedAt > 0n) {
    console.log(`  Evidence already exists for subject ${subject}`);
    return null;
  }

  const tx = await amm.connect(signer).submitEvidence(
    subject,
    evidenceType,
    contentHash,
    uri
  );

  const receipt = await tx.wait();

  console.log(`  Evidence anchored: ${tx.hash}`);
  console.log(`  Evidence type: ${evidenceType}`);
  console.log(`  URI: ${uri}`);

  return { tx, receipt, contentHash };
}

async function main() {
  const deploymentPath = path.join(process.cwd(), "deployments", "localhost.json");

  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Missing deployments/localhost.json. Run deploy first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const [admin, operator, auditor, publicTrader, whaleTrader] =
    await ethers.getSigners();

  const tokenA = await ethers.getContractAt(
    "MockERC20",
    deployment.contracts.tokenA
  );

  const tokenB = await ethers.getContractAt(
    "MockERC20",
    deployment.contracts.tokenB
  );

  const amm = await ethers.getContractAt("SimpleAMM", deployment.contracts.amm);

  const lpToken = await ethers.getContractAt(
    "LPToken",
    deployment.contracts.lpToken
  );

  const stakingRewards = await ethers.getContractAt(
    "StakingRewards",
    deployment.contracts.stakingRewards
  );

  console.log("====================================");
  console.log(" Seeding demo data for DEXCK AMM");
  console.log("====================================");
  console.log("Admin:", admin.address);
  console.log("Operator:", operator.address);
  console.log("Auditor:", auditor.address);
  console.log("Public Trader:", publicTrader.address);
  console.log("Whale Trader:", whaleTrader.address);

  console.log("\nPreparing demo balances...");

  for (const account of [operator, auditor, publicTrader, whaleTrader]) {
    await (await tokenA.connect(admin).transfer(account.address, toWei(25000))).wait();
    await (await tokenB.connect(admin).transfer(account.address, toWei(25000))).wait();

    console.log(`  Funded ${account.address} with 25,000 DTA + 25,000 DTB`);
  }

  await (await tokenA.connect(operator).approve(await amm.getAddress(), toWei(10000))).wait();
  await (await tokenB.connect(operator).approve(await amm.getAddress(), toWei(10000))).wait();

  await safeTx("Operator adds 2,000 DTA + 2,000 DTB liquidity", () =>
    amm.connect(operator).addLiquidity(toWei(2000), toWei(2000))
  );

  await (await tokenA.connect(publicTrader).approve(await amm.getAddress(), toWei(5000))).wait();
  await (await tokenB.connect(publicTrader).approve(await amm.getAddress(), toWei(5000))).wait();

  const normalSwap = await safeTx("Public Trader swaps 100 DTA → DTB", () =>
    amm.connect(publicTrader).swapExactTokenAForTokenB(toWei(100), 1)
  );

  if (normalSwap) {
    const receiptData = {
      type: "trade-receipt",
      demo: true,
      traderHash: ethers.keccak256(
        ethers.toUtf8Bytes(`wallet:${publicTrader.address.toLowerCase()}`)
      ),
      txHash: normalSwap.tx.hash,
      blockNumber: normalSwap.receipt.blockNumber,
      action: "SWAP_DTA_TO_DTB",
      amountIn: "100 DTA",
      note: "Seeded demo trade receipt anchored on-chain.",
      createdAt: new Date().toISOString(),
    };

    await anchorEvidence({
      amm,
      signer: publicTrader,
      subject: normalSwap.tx.hash,
      evidenceType: 1,
      data: receiptData,
      uri: `local://seed/trade-receipt-${normalSwap.tx.hash}`,
    });
  }

  await (await tokenA.connect(whaleTrader).approve(await amm.getAddress(), toWei(15000))).wait();

  const whaleSwap = await safeTx("Whale Trader swaps 10,000 DTA → DTB", () =>
    amm.connect(whaleTrader).swapExactTokenAForTokenB(toWei(10000), 1)
  );

  if (whaleSwap) {
    const whaleReceipt = {
      type: "trade-receipt",
      demo: true,
      traderHash: ethers.keccak256(
        ethers.toUtf8Bytes(`wallet:${whaleTrader.address.toLowerCase()}`)
      ),
      txHash: whaleSwap.tx.hash,
      blockNumber: whaleSwap.receipt.blockNumber,
      action: "WHALE_SWAP_DTA_TO_DTB",
      amountIn: "10000 DTA",
      note: "Large swap used to trigger risk and forensic monitoring.",
      createdAt: new Date().toISOString(),
    };

    await anchorEvidence({
      amm,
      signer: whaleTrader,
      subject: whaleSwap.tx.hash,
      evidenceType: 1,
      data: whaleReceipt,
      uri: `local://seed/whale-trade-receipt-${whaleSwap.tx.hash}`,
    });
  }

  const operatorLpBalance = await lpToken.balanceOf(operator.address);

  if (operatorLpBalance > 0n) {
    await (await lpToken.connect(operator).approve(await amm.getAddress(), operatorLpBalance / 2n)).wait();

    await safeTx("Operator removes half of owned LP liquidity", () =>
      amm.connect(operator).removeLiquidity(operatorLpBalance / 2n)
    );
  }

  const adminLpBalance = await lpToken.balanceOf(admin.address);

  if (adminLpBalance > 0n) {
    await (await lpToken.connect(admin).approve(await stakingRewards.getAddress(), toWei(500))).wait();

    await safeTx("Admin stakes 500 ALP into farming contract", () =>
      stakingRewards.connect(admin).stake(toWei(500))
    );
  }

  const auditSubject = ethers.keccak256(
    ethers.toUtf8Bytes(`seed-audit-note-${Date.now()}`)
  );

  await safeTx("Auditor submits audit note", () =>
    amm
      .connect(auditor)
      .submitAuditNote(auditSubject, "local://seed/audit-note-risk-review")
  );

  const governanceData = {
    type: "governance-proposal",
    title: "Future AMM Formula Upgrade",
    description:
      "If the DEX later supports another AMM formula, deploy a new pool contract and migrate liquidity through governance and evidence anchoring.",
    proposer: operator.address,
    createdAt: new Date().toISOString(),
  };

  await anchorEvidence({
    amm,
    signer: operator,
    subject: hashJson({
      type: "governance-proposal-subject",
      title: governanceData.title,
    }),
    evidenceType: 4,
    data: governanceData,
    uri: "local://seed/governance-formula-upgrade",
  });

  const forensicReport = {
    type: "pool-audit-report",
    title: "Seeded Demo Forensic Report",
    summary:
      "This report is generated for demo purposes to show evidence anchoring for suspicious activity investigation.",
    findings: [
      "Normal swap detected.",
      "Large whale swap detected.",
      "Liquidity movement detected.",
      "Evidence anchoring enabled.",
    ],
    createdAt: new Date().toISOString(),
  };

  await anchorEvidence({
    amm,
    signer: auditor,
    subject: hashJson({
      type: "seeded-forensic-report",
      createdAt: forensicReport.createdAt,
    }),
    evidenceType: 3,
    data: forensicReport,
    uri: "local://seed/forensic-report",
  });

  const [reserveA, reserveB] = await amm.getReserves();

  console.log("\n====================================");
  console.log(" Demo seed completed");
  console.log("====================================");
  console.log("Reserve DTA:", ethers.formatUnits(reserveA, 18));
  console.log("Reserve DTB:", ethers.formatUnits(reserveB, 18));
  console.log("Admin ALP:", ethers.formatUnits(await lpToken.balanceOf(admin.address), 18));
  console.log(
    "Operator ALP:",
    ethers.formatUnits(await lpToken.balanceOf(operator.address), 18)
  );
  console.log("");
  console.log("Open frontend and check:");
  console.log("- Trade chart");
  console.log("- System Activity");
  console.log("- Audit Trail");
  console.log("- Evidence");
  console.log("- Risk Monitor");
  console.log("- Forensics Center");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});