import fs from "fs";
import path from "path";

const rootDir = process.cwd();

const abiMap = [
  ["SimpleAMM", "contracts/SimpleAMM.sol/SimpleAMM.json"],
  ["MockERC20", "contracts/MockERC20.sol/MockERC20.json"],
  ["LPToken", "contracts/LPToken.sol/LPToken.json"],
  ["DEXRewardToken", "contracts/DEXRewardToken.sol/DEXRewardToken.json"],
  ["StakingRewards", "contracts/StakingRewards.sol/StakingRewards.json"],
];

const frontendAbiDir = path.join(rootDir, "frontend", "src", "abi");
const frontendContractsDir = path.join(rootDir, "frontend", "src", "contracts");

fs.mkdirSync(frontendAbiDir, { recursive: true });
fs.mkdirSync(frontendContractsDir, { recursive: true });

for (const [name, artifactPath] of abiMap) {
  const fullArtifactPath = path.join(rootDir, "artifacts", artifactPath);

  if (!fs.existsSync(fullArtifactPath)) {
    throw new Error(`Missing artifact: ${fullArtifactPath}. Run npm run compile first.`);
  }

  const artifact = JSON.parse(fs.readFileSync(fullArtifactPath, "utf8"));

  fs.writeFileSync(
    path.join(frontendAbiDir, `${name}.json`),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log(`Synced ABI: ${name}`);
}

const deploymentPath = path.join(rootDir, "deployments", "localhost.json");

if (fs.existsSync(deploymentPath)) {
  fs.copyFileSync(
    deploymentPath,
    path.join(frontendContractsDir, "addresses.json")
  );

  console.log("Synced deployment: frontend/src/contracts/addresses.json");
} else {
  console.warn("No deployments/localhost.json found. Deploy first if frontend needs addresses.");
}

console.log("Frontend contract files synced.");