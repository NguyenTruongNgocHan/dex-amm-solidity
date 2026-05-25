import { expect } from "chai";
import hre from "hardhat";

describe("ERC20 Compliance and LP Token Security", function () {
    let ethers;
    let owner;
    let alice;
    let bob;

    let tokenA;
    let tokenB;
    let rewardToken;
    let amm;
    let lpToken;

    const toWei = (value) => ethers.parseUnits(value, 18);

    beforeEach(async function () {
        ({ ethers } = await hre.network.create());

        [owner, alice, bob] = await ethers.getSigners();

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

        rewardToken = await ethers.deployContract("DEXRewardToken");

        amm = await ethers.deployContract("SimpleAMM", [
            await tokenA.getAddress(),
            await tokenB.getAddress(),
        ]);

        lpToken = await ethers.getContractAt("LPToken", await amm.lpToken());
    });

    async function expectERC20Metadata(token, expectedName, expectedSymbol) {
        expect(await token.name()).to.equal(expectedName);
        expect(await token.symbol()).to.equal(expectedSymbol);
        expect(await token.decimals()).to.equal(18);
    }

    it("should mint initial supply for demo pool tokens", async function () {
        expect(await tokenA.totalSupply()).to.equal(toWei("1000000"));
        expect(await tokenB.totalSupply()).to.equal(toWei("1000000"));
    });

    it("should start reward token with zero supply and mint rewards on demand", async function () {
        expect(await rewardToken.totalSupply()).to.equal(0n);

        await rewardToken.mint(alice.address, toWei("100"));

        expect(await rewardToken.totalSupply()).to.equal(toWei("100"));
        expect(await rewardToken.balanceOf(alice.address)).to.equal(toWei("100"));
    });

    it("should expose correct ERC20 metadata for Demo Token A", async function () {
        await expectERC20Metadata(tokenA, "Demo Token A", "DTA");
    });

    it("should expose correct ERC20 metadata for Demo Token B", async function () {
        await expectERC20Metadata(tokenB, "Demo Token B", "DTB");
    });

    it("should expose correct ERC20 metadata for reward token", async function () {
        await expectERC20Metadata(rewardToken, "DEX Reward Token", "DRX");
    });

    it("should support ERC20 transfer and emit Transfer event", async function () {
        await expect(tokenA.transfer(alice.address, toWei("10")))
            .to.emit(tokenA, "Transfer")
            .withArgs(owner.address, alice.address, toWei("10"));

        expect(await tokenA.balanceOf(alice.address)).to.equal(toWei("10"));
    });

    it("should support approve and emit Approval event", async function () {
        await tokenA.transfer(alice.address, toWei("100"));

        await expect(tokenA.connect(alice).approve(bob.address, toWei("30")))
            .to.emit(tokenA, "Approval")
            .withArgs(alice.address, bob.address, toWei("30"));

        expect(await tokenA.allowance(alice.address, bob.address)).to.equal(
            toWei("30")
        );
    });

    it("should support transferFrom and decrease allowance", async function () {
        await tokenA.transfer(alice.address, toWei("100"));
        await tokenA.connect(alice).approve(bob.address, toWei("30"));

        await expect(
            tokenA.connect(bob).transferFrom(alice.address, bob.address, toWei("20"))
        )
            .to.emit(tokenA, "Transfer")
            .withArgs(alice.address, bob.address, toWei("20"));

        expect(await tokenA.balanceOf(bob.address)).to.equal(toWei("20"));
        expect(await tokenA.allowance(alice.address, bob.address)).to.equal(
            toWei("10")
        );
    });

    it("should allow only minter to mint reward token", async function () {
        await rewardToken.mint(alice.address, toWei("100"));

        expect(await rewardToken.balanceOf(alice.address)).to.equal(toWei("100"));

        await expect(
            rewardToken.connect(alice).mint(alice.address, toWei("1"))
        ).to.be.revertedWithCustomError(
            rewardToken,
            "AccessControlUnauthorizedAccount"
        );
    });

    it("should mint LP token only through AMM addLiquidity", async function () {
        await tokenA.approve(await amm.getAddress(), toWei("1000"));
        await tokenB.approve(await amm.getAddress(), toWei("1000"));

        await expect(amm.addLiquidity(toWei("1000"), toWei("1000")))
            .to.emit(lpToken, "Transfer")
            .withArgs(ethers.ZeroAddress, owner.address, toWei("1000"));

        expect(await lpToken.name()).to.equal("AMM LP Token");
        expect(await lpToken.symbol()).to.equal("ALP");
        expect(await lpToken.balanceOf(owner.address)).to.equal(toWei("1000"));
    });

    it("should prevent normal users from minting LP token directly", async function () {
        await expect(
            lpToken.connect(alice).mint(alice.address, toWei("1"))
        ).to.be.revertedWith("Only AMM can call");
    });

    it("should prevent normal users from burning LP token directly", async function () {
        await expect(
            lpToken.connect(alice).burn(alice.address, toWei("1"))
        ).to.be.revertedWith("Only AMM can call");
    });
});