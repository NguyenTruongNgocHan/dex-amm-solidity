import { expect } from "chai";
import hre from "hardhat";

describe("SimpleAMM with LPToken", function () {
  let ethers;
  let owner;
  let alice;
  let bob;
  let tokenA;
  let tokenB;
  let amm;
  let lpToken;

  const toWei = (value) => ethers.parseUnits(value, 18);

  async function getFutureDeadline() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp + 3600;
  }

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [owner, alice, bob] = await ethers.getSigners();

    tokenA = await ethers.deployContract("MockERC20", [
      "Token A",
      "TKA",
      toWei("1000000")
    ]);

    tokenB = await ethers.deployContract("MockERC20", [
      "Token B",
      "TKB",
      toWei("1000000")
    ]);

    amm = await ethers.deployContract("SimpleAMM", [
      await tokenA.getAddress(),
      await tokenB.getAddress()
    ]);

    lpToken = await ethers.getContractAt("LPToken", await amm.lpToken());

    await tokenA.transfer(alice.address, toWei("10000"));
    await tokenB.transfer(alice.address, toWei("10000"));

    await tokenA.transfer(bob.address, toWei("10000"));
    await tokenB.transfer(bob.address, toWei("10000"));
  });

  async function approveAndAddInitialLiquidity(provider = owner) {
    await tokenA.connect(provider).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(provider).approve(await amm.getAddress(), toWei("1000"));

    await amm.connect(provider).addLiquidity(toWei("1000"), toWei("1000"));
  }

  it("should add liquidity and mint LP tokens", async function () {
    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));

    await expect(amm.addLiquidity(toWei("1000"), toWei("1000")))
      .to.emit(amm, "LiquidityAdded");

    expect(await lpToken.balanceOf(owner.address)).to.equal(toWei("1000"));
    expect(await amm.totalLiquidity()).to.equal(toWei("1000"));
    expect(await amm.reserveA()).to.equal(toWei("1000"));
    expect(await amm.reserveB()).to.equal(toWei("1000"));
  });

  it("should expose reserves, price and k value", async function () {
    await approveAndAddInitialLiquidity();

    const [reserveA, reserveB] = await amm.getReserves();

    expect(reserveA).to.equal(toWei("1000"));
    expect(reserveB).to.equal(toWei("1000"));
    expect(await amm.getPriceAInB()).to.equal(toWei("1"));
    expect(await amm.getPriceBInA()).to.equal(toWei("1"));
    expect(await amm.getK()).to.equal(toWei("1000") * toWei("1000"));
  });

  it("should quote amount out before swapping", async function () {
    await approveAndAddInitialLiquidity();

    const quotedOut = await amm.getAmountOut(await tokenA.getAddress(), toWei("10"));

    expect(quotedOut).to.be.greaterThan(0n);
    expect(quotedOut).to.be.lessThan(toWei("10"));
  });

  it("should quote liquidity before adding liquidity", async function () {
    await approveAndAddInitialLiquidity();

    const quotedLiquidity = await amm.quoteAddLiquidity(toWei("100"), toWei("100"));

    expect(quotedLiquidity).to.equal(toWei("100"));
  });

  it("should reject invalid liquidity ratio after pool is initialized", async function () {
    await approveAndAddInitialLiquidity();

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("100"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("200"));

    await expect(
      amm.connect(alice).addLiquidity(toWei("100"), toWei("200"))
    ).to.be.revertedWith("Invalid pool ratio");
  });

  it("should add liquidity with deadline and minimum LP protection", async function () {
    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("1000"));

    const deadline = await getFutureDeadline();

    await expect(
      amm.connect(alice).addLiquidity(
        toWei("1000"),
        toWei("1000"),
        toWei("999"),
        deadline
      )
    ).to.emit(amm, "LiquidityAdded");

    expect(await lpToken.balanceOf(alice.address)).to.equal(toWei("1000"));
  });

  it("should reject expired add liquidity transaction", async function () {
    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("1000"));
    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("1000"));

    await expect(
      amm.connect(alice).addLiquidity(
        toWei("1000"),
        toWei("1000"),
        0,
        1
      )
    ).to.be.revertedWith("Transaction expired");
  });

  it("should swap tokenA for tokenB", async function () {
    await approveAndAddInitialLiquidity();

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("10"));

    const beforeBalanceB = await tokenB.balanceOf(alice.address);

    await expect(
      amm.connect(alice).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.emit(amm, "Swapped");

    const afterBalanceB = await tokenB.balanceOf(alice.address);

    expect(afterBalanceB).to.be.greaterThan(beforeBalanceB);
  });

  it("should swap tokenB for tokenA", async function () {
    await approveAndAddInitialLiquidity();

    await tokenB.connect(alice).approve(await amm.getAddress(), toWei("10"));

    const beforeBalanceA = await tokenA.balanceOf(alice.address);

    await expect(
      amm.connect(alice).swapExactTokenBForTokenA(toWei("10"), 1)
    ).to.emit(amm, "Swapped");

    const afterBalanceA = await tokenA.balanceOf(alice.address);

    expect(afterBalanceA).to.be.greaterThan(beforeBalanceA);
  });

  it("should reject swap if pool is empty", async function () {
    await tokenA.connect(bob).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(bob).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.be.revertedWith("Empty pool");
  });

  it("should reject swap when minAmountOut is too high", async function () {
    await approveAndAddInitialLiquidity();

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(alice).swapExactTokenAForTokenB(toWei("10"), toWei("1000"))
    ).to.be.revertedWith("Slippage too high");
  });

  it("should reject expired swap transaction", async function () {
    await approveAndAddInitialLiquidity();

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(alice)["swapExactTokenAForTokenB(uint256,uint256,uint256)"](
        toWei("10"),
        1,
        1
      )
    ).to.be.revertedWith("Transaction expired");
  });

  it("should not decrease k after swap because fee stays in pool", async function () {
    await approveAndAddInitialLiquidity();

    const kBefore = await amm.getK();

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("10"));
    await amm.connect(alice).swapExactTokenAForTokenB(toWei("10"), 1);

    const kAfter = await amm.getK();

    expect(kAfter).to.be.greaterThanOrEqual(kBefore);
  });

  it("should remove liquidity and burn LP tokens", async function () {
    await approveAndAddInitialLiquidity();

    const lpBalance = await lpToken.balanceOf(owner.address);

    await expect(amm.removeLiquidity(lpBalance / 2n))
      .to.emit(amm, "LiquidityRemoved");

    expect(await lpToken.balanceOf(owner.address)).to.equal(lpBalance / 2n);
  });

  it("should remove liquidity with minimum output and deadline protection", async function () {
    await approveAndAddInitialLiquidity();

    const deadline = await getFutureDeadline();
    const lpBalance = await lpToken.balanceOf(owner.address);

    await expect(
      amm.removeLiquidity(
        lpBalance / 2n,
        toWei("400"),
        toWei("400"),
        deadline
      )
    ).to.emit(amm, "LiquidityRemoved");
  });

  it("should fail removeLiquidity if user does not have enough LP tokens", async function () {
    await approveAndAddInitialLiquidity();

    await expect(
      amm.connect(bob).removeLiquidity(toWei("1"))
    ).to.be.revertedWith("Not enough LP");
  });

  it("should reject expired remove liquidity transaction", async function () {
    await approveAndAddInitialLiquidity();

    const lpBalance = await lpToken.balanceOf(owner.address);

    await expect(
      amm.removeLiquidity(lpBalance / 2n, 0, 0, 1)
    ).to.be.revertedWith("Transaction expired");
  });

  it("should emit events for liquidity and swap actions", async function () {
    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));

    await expect(amm.addLiquidity(toWei("1000"), toWei("1000")))
      .to.emit(amm, "LiquidityAdded");

    await tokenA.connect(alice).approve(await amm.getAddress(), toWei("10"));

    await expect(
      amm.connect(alice).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.emit(amm, "Swapped");

    const lpBalance = await lpToken.balanceOf(owner.address);

    await expect(amm.removeLiquidity(lpBalance / 2n))
      .to.emit(amm, "LiquidityRemoved");
  });
});