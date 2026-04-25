import { ethers } from "ethers";
import { parseToken, formatToken } from "./format";

export function calculatePairedAmount(inputAmount, reserveInRaw, reserveOutRaw) {
  if (!inputAmount || Number(inputAmount) <= 0) return "";

  const reserveIn = BigInt(reserveInRaw || 0n);
  const reserveOut = BigInt(reserveOutRaw || 0n);

  if (reserveIn <= 0n || reserveOut <= 0n) return "";

  const inputRaw = parseToken(inputAmount);
  const outputRaw = (inputRaw * reserveOut) / reserveIn;

  return formatToken(outputRaw, 18, 6).replaceAll(",", "");
}

export function calculateLiquidityPreview(amountA, amountB, reserveARaw, reserveBRaw, lpBalance) {
  if (!amountA || !amountB || Number(amountA) <= 0 || Number(amountB) <= 0) {
    return "0";
  }

  const a = Number(amountA);
  const b = Number(amountB);

  if (!Number.isFinite(a) || !Number.isFinite(b)) return "0";

  const reserveA = Number(ethers.formatUnits(reserveARaw || 0n, 18));
  const reserveB = Number(ethers.formatUnits(reserveBRaw || 0n, 18));

  if (reserveA <= 0 || reserveB <= 0) {
    return Math.sqrt(a * b).toFixed(4);
  }

  // UI approximation only. Contract is source of truth.
  const lp = Number(String(lpBalance || "0").replaceAll(",", ""));
  if (!Number.isFinite(lp) || lp <= 0) return "0";

  const liquidityA = (a * lp) / reserveA;
  const liquidityB = (b * lp) / reserveB;

  return Math.min(liquidityA, liquidityB).toFixed(4);
}

export function isValidLiquidityInput(amountA, amountB) {
  return Number(amountA) > 0 && Number(amountB) > 0;
}