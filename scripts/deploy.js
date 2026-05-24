import hre from "hardhat";
import fs from "fs";
import path from "path";

const { ethers } = await hre.network.create();

const toWei = (value) => ethers.parseUnits(value, 18);

async function grantRole(contract, role, account, label) {
  const tx = await contract.grantRole(role, account);
  await tx.wait();
  console.log(`Granted ${label} to ${account}`);
}

async function main() {
  const [deployer, alice, bob] = await ethers.getSigners();

  console.log("====================================");
  console.log(" Deploying production-oriented DEX AMM");
  console.log("====================================");
  console.log("Admin / Deployer:", deployer.address);
  console.log("Operator demo wallet:", alice.address);
  console.log("Auditor demo wallet:", bob.address);
  console.log("");

  const tokenA = await ethers.deployContract("MockERC20", [
    "Demo Token A",
    "DTA",
    toWei("1000000"),
  ]);
  await tokenA.waitForDeployment();

  const tokenB = await ethers.deployContract("MockERC20", [
    "Demo Token B",
    "DTB",
    toWei("1000000"),
  ]);
  await tokenB.waitForDeployment();

  const amm = await ethers.deployContract("SimpleAMM", [
    await tokenA.getAddress(),
    await tokenB.getAddress(),
  ]);
  await amm.waitForDeployment();

  const lpTokenAddress = await amm.lpToken();
  const lpToken = await ethers.getContractAt("LPToken", lpTokenAddress);

  const rewardToken = await ethers.deployContract("DEXRewardToken");
  await rewardToken.waitForDeployment();

  const rewardDuration = 7 * 24 * 60 * 60;

  const stakingRewards = await ethers.deployContract("StakingRewards", [
    lpTokenAddress,
    await rewardToken.getAddress(),
    rewardDuration,
  ]);
  await stakingRewards.waitForDeployment();

  const operatorRole = await amm.OPERATOR_ROLE();
  const auditorRole = await amm.AUDITOR_ROLE();

  const stakingOperatorRole = await stakingRewards.OPERATOR_ROLE();
  const stakingAuditorRole = await stakingRewards.AUDITOR_ROLE();

  await grantRole(amm, operatorRole, alice.address, "AMM OPERATOR_ROLE");
  await grantRole(amm, auditorRole, bob.address, "AMM AUDITOR_ROLE");

  await grantRole(
    stakingRewards,
    stakingOperatorRole,
    alice.address,
    "Staking OPERATOR_ROLE"
  );
  await grantRole(
    stakingRewards,
    stakingAuditorRole,
    bob.address,
    "Staking AUDITOR_ROLE"
  );

  console.log("");
  console.log("Contracts deployed:");
  console.log("Token A:", await tokenA.getAddress());
  console.log("Token B:", await tokenB.getAddress());
  console.log("AMM:", await amm.getAddress());
  console.log("LP Token:", lpTokenAddress);
  console.log("Reward Token:", await rewardToken.getAddress());
  console.log("Staking Rewards:", await stakingRewards.getAddress());
  console.log("");

  console.log("Preparing demo balances...");

  await tokenA.transfer(alice.address, toWei("10000"));
  await tokenB.transfer(alice.address, toWei("10000"));
  await tokenA.transfer(bob.address, toWei("10000"));
  await tokenB.transfer(bob.address, toWei("10000"));

  await tokenA.approve(await amm.getAddress(), toWei("10000"));
  await tokenB.approve(await amm.getAddress(), toWei("10000"));

  await amm.addLiquidity(toWei("5000"), toWei("5000"));

  await rewardToken.mint(await stakingRewards.getAddress(), toWei("50000"));
  await stakingRewards.notifyRewardAmount(toWei("50000"));

  const [reserveA, reserveB] = await amm.getReserves();

  console.log("Initial pool:");
  console.log("Reserve A:", ethers.formatUnits(reserveA, 18), "DTA");
  console.log("Reserve B:", ethers.formatUnits(reserveB, 18), "DTB");
  console.log(
    "Initial LP balance:",
    ethers.formatUnits(await lpToken.balanceOf(deployer.address), 18)
  );
  console.log("");

  const deployment = {
    network: hre.network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    demoAccounts: {
      admin: deployer.address,
      operator: alice.address,
      auditor: bob.address,
      alice: alice.address,
      bob: bob.address,
    },
    roles: {
      defaultAdminRole: ethers.ZeroHash,
      operatorRole,
      auditorRole,
      model: {
        admin: "Can grant/revoke roles and pause/unpause the system.",
        operator:
          "Can enable/disable trading and configure operational parameters.",
        auditor:
          "Can submit audit notes and review role-controlled system activity.",
      },
    },
    contracts: {
      tokenA: await tokenA.getAddress(),
      tokenB: await tokenB.getAddress(),
      amm: await amm.getAddress(),
      lpToken: lpTokenAddress,
      rewardToken: await rewardToken.getAddress(),
      stakingRewards: await stakingRewards.getAddress(),
    },
    symbols: {
      tokenA: "DTA",
      tokenB: "DTB",
      lpToken: "ALP",
      rewardToken: "DRX",
    },
    initialPool: {
      reserveA: reserveA.toString(),
      reserveB: reserveB.toString(),
    },
    createdAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  fs.writeFileSync(
    path.join(deploymentsDir, "localhost.json"),
    JSON.stringify(deployment, null, 2)
  );

  const frontendDir = path.join(process.cwd(), "frontend", "src", "contracts");
  fs.mkdirSync(frontendDir, { recursive: true });

  fs.writeFileSync(
    path.join(frontendDir, "addresses.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("Deployment files generated:");
  console.log("- deployments/localhost.json");
  console.log("- frontend/src/contracts/addresses.json");
  console.log("");
  console.log("Role model ready:");
  console.log("- Admin:", deployer.address);
  console.log("- Operator:", alice.address);
  console.log("- Auditor:", bob.address);
  console.log("");
  console.log("Demo ready. Run frontend and connect MetaMask to localhost:8545.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});