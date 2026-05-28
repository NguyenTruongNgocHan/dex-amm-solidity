import hre from "hardhat";
import fs from "fs";

const { ethers } = await hre.network.create();

async function main() {
  const deployment = JSON.parse(
    fs.readFileSync("./deployments/localhost.json", "utf8")
  );

  const [admin, operator] = await ethers.getSigners();

  const amm = await ethers.getContractAt(
    "SimpleAMM",
    deployment.contracts.amm
  );

  const tx = await amm
    .connect(operator)
    .setLiquidityProviderApprovalRequired(false);

  await tx.wait();

  const policy = await amm.getProductionPolicy();

  console.log("LP approval policy disabled!");
  console.log("isLpApprovalRequired:", policy.isLpApprovalRequired ?? policy[4]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});