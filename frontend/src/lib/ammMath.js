import { ethers } from "ethers";

export const AMM_FEE_BPS = 30n;
export const BPS_DENOMINATOR = 10000n;

export function getAmountOut(amountInRaw, reserveInRaw, reserveOutRaw) {
  const amountIn = BigInt(amountInRaw);
  const reserveIn = BigInt(reserveInRaw);
  const reserveOut = BigInt(reserveOutRaw);

  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) {
    return 0n;
  }

  // Contract fee: 0.3% => amountIn * 997 / 1000
  const amountInWithFee = (amountIn * 997n) / 1000n;

  return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
}

export function applySlippage(amountOutRaw, slippageBps) {
  const amountOut = BigInt(amountOutRaw);
  const bps = BigInt(slippageBps);

  if (amountOut <= 0n) return 0n;
  if (bps < 0n || bps >= BPS_DENOMINATOR) {
    throw new Error("Invalid slippage tolerance");
  }

  return (amountOut * (BPS_DENOMINATOR - bps)) / BPS_DENOMINATOR;
}

export function calculatePriceImpact({
  amountInRaw,
  amountOutRaw,
  reserveInRaw,
  reserveOutRaw,
}) {
  try {
    const amountIn = Number(ethers.formatUnits(amountInRaw || 0n, 18));
    const amountOut = Number(ethers.formatUnits(amountOutRaw || 0n, 18));
    const reserveIn = Number(ethers.formatUnits(reserveInRaw || 0n, 18));
    const reserveOut = Number(ethers.formatUnits(reserveOutRaw || 0n, 18));

    if (
      amountIn <= 0 ||
      amountOut <= 0 ||
      reserveIn <= 0 ||
      reserveOut <= 0
    ) {
      return 0;
    }

    const spotPrice = reserveOut / reserveIn;
    const executionPrice = amountOut / amountIn;

    return Math.max(((spotPrice - executionPrice) / spotPrice) * 100, 0);
  } catch {
    return 0;
  }
}

export function getPriceImpactTone(priceImpactNumber) {
  if (priceImpactNumber >= 5) return "danger";
  if (priceImpactNumber >= 1) return "warning";
  return "success";
}

export function formatQuote(value, decimals = 18, max = 4) {
  const formatted = ethers.formatUnits(value, decimals);
  const number = Number(formatted);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("en-US", {
    maximumFractionDigits: max,
  });
}

export function formatBpsToPercent(bps) {
  return `${(Number(bps) / 100).toFixed(Number(bps) % 100 === 0 ? 0 : 2)}%`;
}