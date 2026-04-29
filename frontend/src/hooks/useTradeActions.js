import { useState } from "react";
import { getAMM, getTokenA, getTokenB } from "../lib/contracts";
import { parseToken } from "../lib/format";
import {
  createTradeReceipt,
  saveTradeReceipt,
  uploadJsonToIPFS,
} from "../lib/ipfs";

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
      throw new Error("Wallet is not connected.");
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const ammAddress = await amm.getAddress();
      const trader = await signer.getAddress();

      const parsedAmountIn = parseToken(amountIn);
      const parsedMinAmountOut = parseToken(minAmountOut);

      setStatus?.("Approving TokenA...");
      const approveTx = await tokenA.approve(ammAddress, parsedAmountIn);
      await approveTx.wait();

      setStatus?.("Swapping TokenA to TokenB...");
      const swapTx = await amm.swapExactTokenAForTokenB(
        parsedAmountIn,
        parsedMinAmountOut
      );

      const receipt = await swapTx.wait();

      const tradeReceipt = createTradeReceipt({
        txHash: swapTx.hash,
        trader,
        direction: "A_TO_B",
        tokenIn: "TKA",
        tokenOut: "TKB",
        amountIn,
        minAmountOut,
        blockNumber: receipt.blockNumber,
      });

      await uploadReceiptSafely(tradeReceipt);

      setStatus?.("Swap TokenA → TokenB successful. Receipt saved.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setStatus?.(error.shortMessage || error.message || "Swap failed.");
    } finally {
      setPending(false);
    }
  }

  async function swapTokenBForTokenA(amountIn, minAmountOut = "0") {
    if (!signer) {
      throw new Error("Wallet is not connected.");
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenB = getTokenB(signer);
      const ammAddress = await amm.getAddress();
      const trader = await signer.getAddress();

      const parsedAmountIn = parseToken(amountIn);
      const parsedMinAmountOut = parseToken(minAmountOut);

      setStatus?.("Approving TokenB...");
      const approveTx = await tokenB.approve(ammAddress, parsedAmountIn);
      await approveTx.wait();

      setStatus?.("Swapping TokenB to TokenA...");
      const swapTx = await amm.swapExactTokenBForTokenA(
        parsedAmountIn,
        parsedMinAmountOut
      );

      const receipt = await swapTx.wait();

      const tradeReceipt = createTradeReceipt({
        txHash: swapTx.hash,
        trader,
        direction: "B_TO_A",
        tokenIn: "TKB",
        tokenOut: "TKA",
        amountIn,
        minAmountOut,
        blockNumber: receipt.blockNumber,
      });

      await uploadReceiptSafely(tradeReceipt);

      setStatus?.("Swap TokenB → TokenA successful. Receipt saved.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setStatus?.(error.shortMessage || error.message || "Swap failed.");
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