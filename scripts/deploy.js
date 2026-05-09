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

  const lpTokenAddress = await amm.lpToken();

  const rewardToken = await ethers.deployContract("DEXRewardToken");

  const stakingRewards = await ethers.deployContract("StakingRewards", [
    lpTokenAddress,
    await rewardToken.getAddress(),
    7 * 24 * 60 * 60,
  ]);

  const farmReward = toWei("50000");

  await rewardToken.mint(await stakingRewards.getAddress(), farmReward);
  await stakingRewards.notifyRewardAmount(farmReward);

  console.log("TokenA:", await tokenA.getAddress());
  console.log("TokenB:", await tokenB.getAddress());
  console.log("AMM:", await amm.getAddress());
  console.log("RewardToken:", await rewardToken.getAddress());
  console.log("StakingRewards:", await stakingRewards.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});