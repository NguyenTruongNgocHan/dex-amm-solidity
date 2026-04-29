import { useState } from "react";
import { getAMM, getTokenA, getTokenB } from "../lib/contracts";
import { parseToken } from "../lib/format";

export default function useTradeActions(signer, reload, setStatus) {
  const [pending, setPending] = useState(false);

  async function swapTokenAForTokenB(amountIn, minAmountOut = "0") {
    if (!signer) {
      throw new Error("Wallet is not connected.");
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const ammAddress = await amm.getAddress();

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
      await swapTx.wait();

      setStatus?.("Swap TokenA → TokenB successful.");
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
      await swapTx.wait();

      setStatus?.("Swap TokenB → TokenA successful.");
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