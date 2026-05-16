import { useState } from "react";
import { getAMM, getTokenA, getTokenB } from "../lib/contracts";
import { parseToken, formatToken } from "../lib/format";
import { calculateRemoveLiquidityPreview } from "../lib/liquidityMath";
import { SYMBOLS } from "../config/contracts";

function getErrorMessage(error, fallback) {
  return error?.reason || error?.shortMessage || error?.message || fallback;
}

async function approveIfNeeded(token, owner, spender, amount, label, setStatus) {
  const allowance = await token.allowance(owner, spender);

  if (allowance >= amount) return;

  setStatus?.(`Approving ${label}...`);
  const tx = await token.approve(spender, amount);
  await tx.wait();
}

export default function useLiquidityActions(signer, reload, setStatus) {
  const [pending, setPending] = useState(false);

  async function addLiquidity(amountA, amountB) {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const userAddress = await signer.getAddress();

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const tokenB = getTokenB(signer);
      const ammAddress = await amm.getAddress();

      const parsedA = parseToken(amountA);
      const parsedB = parseToken(amountB);

      if (parsedA <= 0n || parsedB <= 0n) {
        throw new Error("Please enter valid liquidity amounts.");
      }

      const [amountAUsed, amountBUsed, quotedLiquidity] =
        await amm.quoteAddLiquidityAmounts(parsedA, parsedB);

      if (amountAUsed <= 0n || amountBUsed <= 0n || quotedLiquidity <= 0n) {
        throw new Error("Liquidity amount is too small.");
      }

      const [balanceA, balanceB] = await Promise.all([
        tokenA.balanceOf(userAddress),
        tokenB.balanceOf(userAddress),
      ]);

      if (balanceA < amountAUsed) {
        throw new Error(`Insufficient ${SYMBOLS.tokenA} balance.`);
      }

      if (balanceB < amountBUsed) {
        throw new Error(`Insufficient ${SYMBOLS.tokenB} balance.`);
      }

      await approveIfNeeded(
        tokenA,
        userAddress,
        ammAddress,
        amountAUsed,
        SYMBOLS.tokenA,
        setStatus
      );

      await approveIfNeeded(
        tokenB,
        userAddress,
        ammAddress,
        amountBUsed,
        SYMBOLS.tokenB,
        setStatus
      );

      const minLiquidity = (quotedLiquidity * 995n) / 1000n;
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      setStatus?.(
        `Adding liquidity: ${formatToken(amountAUsed, 18, 6)} ${SYMBOLS.tokenA} + ${formatToken(amountBUsed, 18, 6)} ${SYMBOLS.tokenB}...`
      );

      const tx = await amm["addLiquidity(uint256,uint256,uint256,uint256)"](
        parsedA,
        parsedB,
        minLiquidity,
        deadline
      );

      await tx.wait();

      setStatus?.("Add liquidity successful.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Add liquidity failed."));
    } finally {
      setPending(false);
    }
  }

  async function removeLiquidity(lpAmount) {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const parsedLP = parseToken(lpAmount);

      if (parsedLP <= 0n) {
        throw new Error("Please enter LP amount greater than 0.");
      }

      const [reserveA, reserveB] = await amm.getReserves();
      const totalLiquidity = await amm.totalLiquidity();

      const preview = calculateRemoveLiquidityPreview(
        lpAmount,
        reserveA,
        reserveB,
        totalLiquidity
      );

      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      setStatus?.("Removing liquidity...");

      const tx = await amm["removeLiquidity(uint256,uint256,uint256,uint256)"](
        parsedLP,
        preview.minAmountA,
        preview.minAmountB,
        deadline
      );

      await tx.wait();

      setStatus?.("Remove liquidity successful.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Remove liquidity failed."));
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    addLiquidity,
    removeLiquidity,
  };
}