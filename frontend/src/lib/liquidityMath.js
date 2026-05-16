import { parseToken, formatToken } from "./format";

export function calculatePairedAmount(inputAmount, reserveInRaw, reserveOutRaw) {
  try {
    if (!inputAmount || Number(inputAmount) <= 0) return "";

    const reserveIn = BigInt(reserveInRaw || 0n);
    const reserveOut = BigInt(reserveOutRaw || 0n);

    if (reserveIn <= 0n || reserveOut <= 0n) return "";

    const inputRaw = parseToken(inputAmount);
    const outputRaw = (inputRaw * reserveOut) / reserveIn;

    return formatToken(outputRaw, 18, 8).replaceAll(",", "");
  } catch {
    return "";
  }
}

export function calculateLiquidityPreview(
  amountA,
  amountB,
  reserveARaw,
  reserveBRaw,
  totalLiquidityRaw
) {
  try {
    if (!amountA || !amountB || Number(amountA) <= 0 || Number(amountB) <= 0) {
      return "0";
    }

    const parsedA = parseToken(amountA);
    const parsedB = parseToken(amountB);

    const reserveA = BigInt(reserveARaw || 0n);
    const reserveB = BigInt(reserveBRaw || 0n);
    const totalLiquidity = BigInt(totalLiquidityRaw || 0n);

    if (reserveA <= 0n || reserveB <= 0n || totalLiquidity <= 0n) {
      const a = Number(amountA);
      const b = Number(amountB);
      return Number.isFinite(a) && Number.isFinite(b)
        ? Math.sqrt(a * b).toFixed(6)
        : "0";
    }

    const liquidityA = (parsedA * totalLiquidity) / reserveA;
    const liquidityB = (parsedB * totalLiquidity) / reserveB;
    const preview = liquidityA < liquidityB ? liquidityA : liquidityB;

    return formatToken(preview, 18, 8).replaceAll(",", "");
  } catch {
    return "0";
  }
}

export function calculateRemoveLiquidityPreview(
  lpAmount,
  reserveARaw,
  reserveBRaw,
  totalLiquidityRaw
) {
  try {
    const lpRaw = parseToken(lpAmount || "0");
    const reserveA = BigInt(reserveARaw || 0n);
    const reserveB = BigInt(reserveBRaw || 0n);
    const totalLiquidity = BigInt(totalLiquidityRaw || 0n);

    if (lpRaw <= 0n || reserveA <= 0n || reserveB <= 0n || totalLiquidity <= 0n) {
      return {
        amountA: 0n,
        amountB: 0n,
        minAmountA: 0n,
        minAmountB: 0n,
        amountALabel: "0",
        amountBLabel: "0",
      };
    }

    const amountA = (lpRaw * reserveA) / totalLiquidity;
    const amountB = (lpRaw * reserveB) / totalLiquidity;

    return {
      amountA,
      amountB,
      minAmountA: (amountA * 995n) / 1000n,
      minAmountB: (amountB * 995n) / 1000n,
      amountALabel: formatToken(amountA, 18, 8),
      amountBLabel: formatToken(amountB, 18, 8),
    };
  } catch {
    return {
      amountA: 0n,
      amountB: 0n,
      minAmountA: 0n,
      minAmountB: 0n,
      amountALabel: "0",
      amountBLabel: "0",
    };
  }
}

export function isValidLiquidityInput(amountA, amountB) {
  return Number(amountA) > 0 && Number(amountB) > 0;
}