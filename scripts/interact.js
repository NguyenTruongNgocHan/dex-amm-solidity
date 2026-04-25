import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();

  const [user] = await ethers.getSigners();

  const ammAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const tokenAAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const tokenBAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

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