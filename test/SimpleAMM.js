import { expect } from "chai";
import hre from "hardhat";

describe("SimpleAMM", function () {
  let ethers;
  let owner, alice, bob;
  let tokenA, tokenB, amm;

  const toWei = (value) => ethers.parseUnits(value, 18);

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [owner, alice, bob] = await ethers.getSigners();

    tokenA = await ethers.deployContract("MockERC20", [
      "TokenA",
      "TKA",
      toWei("1000000"),
    ]);

    tokenB = await ethers.deployContract("MockERC20", [
      "TokenB",
      "TKB",
      toWei("1000000"),
    ]);

    amm = await ethers.deployContract("SimpleAMM", [
      await tokenA.getAddress(),
      await tokenB.getAddress(),
    ]);

    await tokenA.mint(alice.address, toWei("10000"));
    await tokenB.mint(alice.address, toWei("10000"));
    await tokenA.mint(bob.address, toWei("10000"));
    await tokenB.mint(bob.address, toWei("10000"));
  });

  it("should add liquidity", async function () {
    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("2000"));

    await amm.connect(alice).addLiquidity(toWei("1000"), toWei("2000"));

    expect(await amm.reserveA()).to.equal(toWei("1000"));
    expect(await amm.reserveB()).to.equal(toWei("2000"));
    expect(await amm.totalLiquidity()).to.be.gt(0n);
  });

  it("should swap tokenA for tokenB", async function () {
    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await amm.connect(alice).addLiquidity(toWei("1000"), toWei("1000"));

    await tokenA.connect(bob).approve(await amm.getAddress(), toWei("100"));
    const balanceBefore = await tokenB.balanceOf(bob.address);

    await amm.connect(bob).swapExactTokenAForTokenB(toWei("100"), 0);

    const balanceAfter = await tokenB.balanceOf(bob.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it("should remove liquidity", async function () {
    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await amm.connect(alice).addLiquidity(toWei("1000"), toWei("1000"));

    const lp = await amm.liquidityOf(alice.address);
    await amm.connect(alice).removeLiquidity(lp / 2n);

    expect(await amm.reserveA()).to.equal(toWei("500"));
    expect(await amm.reserveB()).to.equal(toWei("500"));
  });
});