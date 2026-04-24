import { useState } from "react";
import { getAMM, getTokenA } from "../lib/contracts";
import { parseToken } from "../lib/format";

export default function useTradeActions(signer, reload, setGlobalStatus) {
  const [pending, setPending] = useState(false);

  async function swapTokenAForTokenB(amount, minAmountOut = "0") {
    if (!signer) {
      throw new Error("Bạn cần kết nối ví trước.");
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const ammAddress = await amm.getAddress();

      const amountIn = parseToken(amount);
      const minOut = parseToken(minAmountOut);

      setGlobalStatus?.("Đang approve TokenA...");
      const approveTx = await tokenA.approve(ammAddress, amountIn);
      await approveTx.wait();

      setGlobalStatus?.("Đang swap TokenA → TokenB...");
      const swapTx = await amm.swapExactTokenAForTokenB(amountIn, minOut);
      await swapTx.wait();

      setGlobalStatus?.("Swap thành công.");
      await reload?.();
    } catch (error) {
      console.error(error);
      setGlobalStatus?.(error.shortMessage || error.message || "Swap thất bại.");
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    swapTokenAForTokenB,
  };
}