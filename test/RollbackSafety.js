import { expect } from "chai";
import hre from "hardhat";

describe("Rollback and Revert Safety", function () {
  let ethers;
  let owner;
  let trader;
  let tokenA;
  let tokenB;
  let amm;
  let lpToken;

  const toWei = (value) => ethers.parseUnits(value, 18);

  beforeEach(async function () {
    ({ ethers } = await hre.network.create());

    [owner, trader] = await ethers.getSigners();

    tokenA = await ethers.deployContract("MockERC20", [
      "Demo Token A",
      "DTA",
      toWei("1000000"),
    ]);

    tokenB = await ethers.deployContract("MockERC20", [
      "Demo Token B",
      "DTB",
      toWei("1000000"),
    ]);

    amm = await ethers.deployContract("SimpleAMM", [
      await tokenA.getAddress(),
      await tokenB.getAddress(),
    ]);

    lpToken = await ethers.getContractAt("LPToken", await amm.lpToken());

    await tokenA.transfer(trader.address, toWei("10000"));
    await tokenB.transfer(trader.address, toWei("10000"));

    await tokenA.approve(await amm.getAddress(), toWei("1000"));
    await tokenB.approve(await amm.getAddress(), toWei("1000"));
    await amm.addLiquidity(toWei("1000"), toWei("1000"));
  });

  async function snapshotState(account = trader.address) {
    const [reserveA, reserveB] = await amm.getReserves();

    return {
      reserveA,
      reserveB,
      totalLiquidity: await amm.totalLiquidity(),
      lpTotalSupply: await lpToken.totalSupply(),
      tokenABalance: await tokenA.balanceOf(account),
      tokenBBalance: await tokenB.balanceOf(account),
      lpBalance: await lpToken.balanceOf(account),
    };
  }

  function expectStateUnchanged(before, after) {
    expect(after.reserveA).to.equal(before.reserveA);
    expect(after.reserveB).to.equal(before.reserveB);
    expect(after.totalLiquidity).to.equal(before.totalLiquidity);
    expect(after.lpTotalSupply).to.equal(before.lpTotalSupply);
    expect(after.tokenABalance).to.equal(before.tokenABalance);
    expect(after.tokenBBalance).to.equal(before.tokenBBalance);
    expect(after.lpBalance).to.equal(before.lpBalance);
  }

  it("should rollback swap when slippage protection fails", async function () {
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    const before = await snapshotState();

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), toWei("1000"))
    ).to.be.revertedWith("Slippage too high");

    const after = await snapshotState();

    expectStateUnchanged(before, after);
  });

  it("should rollback swap when deadline expires", async function () {
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    const before = await snapshotState();

    await expect(
      amm
        .connect(trader)
        ["swapExactTokenAForTokenB(uint256,uint256,uint256)"](
          toWei("10"),
          1,
          1
        )
    ).to.be.revertedWith("Transaction expired");

    const after = await snapshotState();

    expectStateUnchanged(before, after);
  });

  it("should rollback add liquidity when minimum LP protection fails", async function () {
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("100"));
    await tokenB.connect(trader).approve(await amm.getAddress(), toWei("100"));

    const before = await snapshotState();

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 3600;

    await expect(
      amm
        .connect(trader)
        .addLiquidity(toWei("100"), toWei("100"), toWei("1000"), deadline)
    ).to.be.revertedWith("Insufficient liquidity minted");

    const after = await snapshotState();

    expectStateUnchanged(before, after);
  });

  it("should rollback remove liquidity when user has no LP tokens", async function () {
    const before = await snapshotState();

    await expect(
      amm.connect(trader).removeLiquidity(toWei("1"))
    ).to.be.revertedWith("Not enough LP");

    const after = await snapshotState();

    expectStateUnchanged(before, after);
  });

  it("should rollback swap when trading is disabled", async function () {
    await amm.setTradingEnabled(false);
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    const before = await snapshotState();

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.be.revertedWith("Trading disabled");

    const after = await snapshotState();

    expectStateUnchanged(before, after);
  });

  it("should rollback swap when token pair is not whitelisted", async function () {
    await amm.setTokenWhitelist(await tokenA.getAddress(), false);
    await tokenA.connect(trader).approve(await amm.getAddress(), toWei("10"));

    const before = await snapshotState();

    await expect(
      amm.connect(trader).swapExactTokenAForTokenB(toWei("10"), 1)
    ).to.be.revertedWith("Token A not whitelisted");

    const after = await snapshotState();

    expectStateUnchanged(before, after);
  });
});