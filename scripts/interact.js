import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();

  const [user] = await ethers.getSigners();

  const ammAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const tokenAAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const tokenBAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const amm = await ethers.getContractAt("SimpleAMM", ammAddress);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddress);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddress);

  const toWei = (v) => ethers.parseUnits(v, 18);

  // approve
  await tokenA.approve(ammAddress, toWei("1000"));
  await tokenB.approve(ammAddress, toWei("1000"));

  console.log("Adding liquidity...");
  await amm.addLiquidity(toWei("1000"), toWei("1000"));

  console.log("Reserves:");
  console.log("A:", (await amm.reserveA()).toString());
  console.log("B:", (await amm.reserveB()).toString());

  console.log("Swapping...");
  await tokenA.approve(ammAddress, toWei("100"));
  await amm.swapExactTokenAForTokenB(toWei("100"), 0);

  console.log("Reserves after swap:");
  console.log("A:", (await amm.reserveA()).toString());
  console.log("B:", (await amm.reserveB()).toString());
}

main();