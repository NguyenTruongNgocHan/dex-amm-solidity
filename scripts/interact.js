import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();

  const [user] = await ethers.getSigners();

  const ammAddress = process.env.NEXT_PUBLIC_AMM_ADDRESS || "";
  const tokenAAddress = process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS || "";
  const tokenBAddress = process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS || "";

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