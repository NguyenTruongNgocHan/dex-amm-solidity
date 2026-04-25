import { useState } from "react";
import { getAMM, getTokenA, getTokenB } from "../lib/contracts";
import { parseToken } from "../lib/format";

export default function useLiquidityActions(signer, reload, setStatus) {
  const [pending, setPending] = useState(false);

  async function addLiquidity(amountA, amountB) {
    if (!signer) throw new Error("Wallet is not connected.");

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const tokenB = getTokenB(signer);
      const ammAddress = await amm.getAddress();

      const parsedA = parseToken(amountA);
      const parsedB = parseToken(amountB);

      setStatus?.("Approving TokenA...");
      const approveA = await tokenA.approve(ammAddress, parsedA);
      await approveA.wait();

      setStatus?.("Approving TokenB...");
      const approveB = await tokenB.approve(ammAddress, parsedB);
      await approveB.wait();

      setStatus?.("Adding liquidity...");
      const tx = await amm.addLiquidity(parsedA, parsedB);
      await tx.wait();

      setStatus?.("Add liquidity successful.");
      await reload?.();
    } catch (error) {
      console.error(error);

      const message =
        error.reason ||
        error.shortMessage ||
        error.message ||
        "Add liquidity failed.";

      setStatus?.(message);
      alert(message);
    } finally {
      setPending(false);
    }
  }

  async function removeLiquidity(lpAmount) {
    if (!signer) throw new Error("Wallet is not connected.");

    try {
      setPending(true);

      const amm = getAMM(signer);
      const parsedLP = parseToken(lpAmount);

      setStatus?.("Removing liquidity...");
      const tx = await amm.removeLiquidity(parsedLP);
      await tx.wait();

      setStatus?.("Remove liquidity successful.");
      await reload?.();
    } catch (error) {
      console.error(error);

      const message =
        error.reason ||
        error.shortMessage ||
        error.message ||
        "Remove liquidity failed.";

      setStatus?.(message);
      alert(message);
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