import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const toWei = (value) => ethers.parseUnits(value, 18);

  const tokenA = await ethers.deployContract("MockERC20", [
    "TokenA",
    "TKA",
    toWei("1000000"),
  ]);

  const tokenB = await ethers.deployContract("MockERC20", [
    "TokenB",
    "TKB",
    toWei("1000000"),
  ]);

  const amm = await ethers.deployContract("SimpleAMM", [
    await tokenA.getAddress(),
    await tokenB.getAddress(),
  ]);

  console.log("TokenA:", await tokenA.getAddress());
  console.log("TokenB:", await tokenB.getAddress());
  console.log("AMM:", await amm.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});