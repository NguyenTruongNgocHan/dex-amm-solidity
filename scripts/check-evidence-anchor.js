import hre from "hardhat";
import fs from "fs";
import path from "path";

const { ethers } = await hre.network.create();

async function main() {
  const deploymentPath = path.join(process.cwd(), "deployments", "localhost.json");

  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Missing deployments/localhost.json. Run deploy first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const [signer] = await ethers.getSigners();

  const ammAddress = deployment.contracts.amm;
  const amm = await ethers.getContractAt("SimpleAMM", ammAddress);

  console.log("Checking Evidence Registry");
  console.log("Signer:", signer.address);
  console.log("AMM:", ammAddress);

  const subject = ethers.keccak256(
    ethers.toUtf8Bytes(`evidence-check-${Date.now()}`)
  );
  const contentHash = ethers.keccak256(
    ethers.toUtf8Bytes("demo-evidence-content")
  );
  const evidenceURI = "local://evidence-runtime-check";

  const before = await amm.getEvidence(subject);

  if (before.submittedAt && before.submittedAt > 0n) {
    throw new Error("Unexpected existing evidence for fresh subject.");
  }

  const tx = await amm.submitEvidence(subject, 1, contentHash, evidenceURI);
  const receipt = await tx.wait();

  const after = await amm.getEvidence(subject);

  console.log("Anchor tx:", tx.hash);
  console.log("Block:", receipt.blockNumber);
  console.log("Evidence type:", after.evidenceType.toString());
  console.log("Content hash:", after.contentHash);
  console.log("Evidence URI:", after.evidenceURI);
  console.log("Submitter:", after.submitter);
  console.log("Submitted at:", after.submittedAt.toString());

  if (after.contentHash !== contentHash) {
    throw new Error("Content hash mismatch after anchoring.");
  }

  if (after.evidenceURI !== evidenceURI) {
    throw new Error("Evidence URI mismatch after anchoring.");
  }

  console.log("Evidence Registry is working.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});