import { useState } from "react";
import { getAMM, getTokenA, getTokenB } from "../lib/contracts";
import { CONTRACTS, SYMBOLS } from "../config/contracts";
import { parseToken, formatToken } from "../lib/format";
import {
  createTradeReceipt,
  saveTradeReceipt,
  uploadJsonToIPFS,
} from "../lib/ipfs";

function getErrorMessage(error, fallback) {
  return error?.reason || error?.shortMessage || error?.message || fallback;
}

async function approveIfNeeded(token, owner, spender, amount, label, setStatus) {
  const allowance = await token.allowance(owner, spender);

  if (allowance >= amount) return;

  setStatus?.(`Approving ${label}...`);
  const approveTx = await token.approve(spender, amount);
  await approveTx.wait();
}

function calculateFee(amountIn) {
  const value = Number(amountIn || 0);

  if (!Number.isFinite(value)) return "0";

  return (value * 0.003).toFixed(8);
}

export default function useTradeActions(signer, reload, setStatus) {
  const [pending, setPending] = useState(false);

  async function uploadReceiptSafely(receipt) {
    try {
      const upload = await uploadJsonToIPFS(
        receipt,
        `trade-receipt-${receipt.txHash}.json`
      );

      const savedReceipt = {
        ...receipt,
        cid: upload.cid,
        ipfsUrl: upload.url,
        ipfsMode: upload.mode,
      };

      saveTradeReceipt(savedReceipt);
      return savedReceipt;
    } catch (error) {
      console.error("Receipt upload failed:", error);

      const savedReceipt = {
        ...receipt,
        cid: "",
        ipfsUrl: "",
        ipfsMode: "failed",
        ipfsError: error.message,
      };

      saveTradeReceipt(savedReceipt);
      return savedReceipt;
    }
  }

  async function swapTokenAForTokenB(amountIn, minAmountOut = "0") {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const ammAddress = await amm.getAddress();
      const trader = await signer.getAddress();

      const parsedAmountIn = parseToken(amountIn);
      const parsedMinAmountOut = parseToken(minAmountOut);

      if (parsedAmountIn <= 0n) {
        throw new Error("Please enter swap amount greater than 0.");
      }

      const balance = await tokenA.balanceOf(trader);

      if (balance < parsedAmountIn) {
        throw new Error(`Insufficient ${SYMBOLS.tokenA} balance.`);
      }

      const quotedOut = await amm.getAmountOut(CONTRACTS.tokenA, parsedAmountIn);

      if (quotedOut < parsedMinAmountOut) {
        throw new Error("Slippage too high. Please refresh quote.");
      }

      await approveIfNeeded(
        tokenA,
        trader,
        ammAddress,
        parsedAmountIn,
        SYMBOLS.tokenA,
        setStatus
      );

      setStatus?.(`Swapping ${SYMBOLS.tokenA} to ${SYMBOLS.tokenB}...`);

      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      const swapTx = await amm[
        "swapExactTokenAForTokenB(uint256,uint256,uint256)"
      ](parsedAmountIn, parsedMinAmountOut, deadline);

      const receipt = await swapTx.wait();

      const tradeReceipt = createTradeReceipt({
        txHash: swapTx.hash,
        trader,
        direction: "A_TO_B",
        tokenIn: SYMBOLS.tokenA,
        tokenOut: SYMBOLS.tokenB,
        amountIn,
        minAmountOut,
        amountOut: formatToken(quotedOut, 18, 8),
        blockNumber: receipt.blockNumber,
        contractAddress: ammAddress,
        slippageTolerance: "User-defined in swap panel",
        priceImpact: "Calculated in frontend preview",
        fee: `${calculateFee(amountIn)} ${SYMBOLS.tokenA}`,
      });

      await uploadReceiptSafely(tradeReceipt);

      setStatus?.("Swap successful. Privacy-safe receipt saved.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Swap failed."));
    } finally {
      setPending(false);
    }
  }

  async function swapTokenBForTokenA(amountIn, minAmountOut = "0") {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenB = getTokenB(signer);
      const ammAddress = await amm.getAddress();
      const trader = await signer.getAddress();

      const parsedAmountIn = parseToken(amountIn);
      const parsedMinAmountOut = parseToken(minAmountOut);

      if (parsedAmountIn <= 0n) {
        throw new Error("Please enter swap amount greater than 0.");
      }

      const balance = await tokenB.balanceOf(trader);

      if (balance < parsedAmountIn) {
        throw new Error(`Insufficient ${SYMBOLS.tokenB} balance.`);
      }

      const quotedOut = await amm.getAmountOut(CONTRACTS.tokenB, parsedAmountIn);

      if (quotedOut < parsedMinAmountOut) {
        throw new Error("Slippage too high. Please refresh quote.");
      }

      await approveIfNeeded(
        tokenB,
        trader,
        ammAddress,
        parsedAmountIn,
        SYMBOLS.tokenB,
        setStatus
      );

      setStatus?.(`Swapping ${SYMBOLS.tokenB} to ${SYMBOLS.tokenA}...`);

      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      const swapTx = await amm[
        "swapExactTokenBForTokenA(uint256,uint256,uint256)"
      ](parsedAmountIn, parsedMinAmountOut, deadline);

      const receipt = await swapTx.wait();

      const tradeReceipt = createTradeReceipt({
        txHash: swapTx.hash,
        trader,
        direction: "B_TO_A",
        tokenIn: SYMBOLS.tokenB,
        tokenOut: SYMBOLS.tokenA,
        amountIn,
        minAmountOut,
        amountOut: formatToken(quotedOut, 18, 8),
        blockNumber: receipt.blockNumber,
        contractAddress: ammAddress,
        slippageTolerance: "User-defined in swap panel",
        priceImpact: "Calculated in frontend preview",
        fee: `${calculateFee(amountIn)} ${SYMBOLS.tokenB}`,
      });

      await uploadReceiptSafely(tradeReceipt);

      setStatus?.("Swap successful. Privacy-safe receipt saved.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Swap failed."));
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    swapTokenAForTokenB,
    swapTokenBForTokenA,
  };
}