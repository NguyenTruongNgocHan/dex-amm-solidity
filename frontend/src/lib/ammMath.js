import { ethers } from "ethers";

export function getAmountOut(amountInRaw, reserveInRaw, reserveOutRaw) {
  const amountIn = BigInt(amountInRaw);
  const reserveIn = BigInt(reserveInRaw);
  const reserveOut = BigInt(reserveOutRaw);

  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) {
    return 0n;
  }

  const amountInWithFee = (amountIn * 997n) / 1000n;

  return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
}

export function applySlippage(amountOutRaw, slippageBps) {
  const amountOut = BigInt(amountOutRaw);
  const bps = BigInt(slippageBps);

  return (amountOut * (10000n - bps)) / 10000n;
}

export function formatQuote(value, decimals = 18, max = 4) {
  const formatted = ethers.formatUnits(value, decimals);
  const number = Number(formatted);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("en-US", {
    maximumFractionDigits: max,
  });
}