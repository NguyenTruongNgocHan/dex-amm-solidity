import { useCallback, useEffect, useState } from "react";
import { getAMM, getLPToken, getTokenA, getTokenB } from "../lib/contracts";
import { formatToken } from "../lib/format";

const emptyData = {
  reserveA: "0",
  reserveB: "0",
  reserveARaw: 0n,
  reserveBRaw: 0n,

  tokenABalance: "0",
  tokenBBalance: "0",

  lpBalance: "0",
  lpBalanceRaw: 0n,
  totalLiquidity: "0",
  totalLiquidityRaw: 0n,
  lpTokenAddress: "",

  lpSharePercent: "0.00",
  claimableA: "0",
  claimableB: "0",

  priceAinB: "0",
  priceBinA: "0",
  tvlLabel: "0",
  hasLiquidity: false,
};

function calculateLPPosition({
  lpBalanceRaw,
  totalLiquidityRaw,
  reserveARaw,
  reserveBRaw,
}) {
  if (
    !lpBalanceRaw ||
    !totalLiquidityRaw ||
    lpBalanceRaw <= 0n ||
    totalLiquidityRaw <= 0n
  ) {
    return {
      lpSharePercent: "0.00",
      claimableA: "0",
      claimableB: "0",
    };
  }

  const claimableARaw = (reserveARaw * lpBalanceRaw) / totalLiquidityRaw;
  const claimableBRaw = (reserveBRaw * lpBalanceRaw) / totalLiquidityRaw;

  const lpBalanceNum = Number(formatToken(lpBalanceRaw, 18, 8).replaceAll(",", ""));
  const totalLiquidityNum = Number(
    formatToken(totalLiquidityRaw, 18, 8).replaceAll(",", "")
  );

  const share =
    totalLiquidityNum > 0 ? (lpBalanceNum / totalLiquidityNum) * 100 : 0;

  return {
    lpSharePercent: Number.isFinite(share) ? share.toFixed(2) : "0.00",
    claimableA: formatToken(claimableARaw),
    claimableB: formatToken(claimableBRaw),
  };
}

export default function useAMMData(provider, address) {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!provider) {
      setData(emptyData);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const amm = getAMM(provider);
      const tokenA = getTokenA(provider);
      const tokenB = getTokenB(provider);

      const [reserveARaw, reserveBRaw, totalLiquidityRaw, lpTokenAddress] =
        await Promise.all([
          amm.reserveA(),
          amm.reserveB(),
          amm.totalLiquidity(),
          amm.lpToken(),
        ]);

      let tokenABalanceRaw = 0n;
      let tokenBBalanceRaw = 0n;
      let lpBalanceRaw = 0n;

      if (address) {
        const lpToken = getLPToken(lpTokenAddress, provider);

        [tokenABalanceRaw, tokenBBalanceRaw, lpBalanceRaw] =
          await Promise.all([
            tokenA.balanceOf(address),
            tokenB.balanceOf(address),
            lpToken.balanceOf(address),
          ]);
      }

      const reserveANum = Number(
        formatToken(reserveARaw, 18, 8).replaceAll(",", "")
      );
      const reserveBNum = Number(
        formatToken(reserveBRaw, 18, 8).replaceAll(",", "")
      );

      const hasLiquidity = reserveANum > 0 && reserveBNum > 0;

      const priceAinB = hasLiquidity
        ? (reserveBNum / reserveANum).toFixed(4)
        : "0";

      const priceBinA = hasLiquidity
        ? (reserveANum / reserveBNum).toFixed(4)
        : "0";

      const lpPosition = calculateLPPosition({
        lpBalanceRaw,
        totalLiquidityRaw,
        reserveARaw,
        reserveBRaw,
      });

      setData({
        reserveA: formatToken(reserveARaw),
        reserveB: formatToken(reserveBRaw),
        reserveARaw,
        reserveBRaw,

        tokenABalance: formatToken(tokenABalanceRaw),
        tokenBBalance: formatToken(tokenBBalanceRaw),

        lpBalance: formatToken(lpBalanceRaw),
        lpBalanceRaw,
        totalLiquidity: formatToken(totalLiquidityRaw),
        totalLiquidityRaw,
        lpTokenAddress,

        lpSharePercent: lpPosition.lpSharePercent,
        claimableA: lpPosition.claimableA,
        claimableB: lpPosition.claimableB,

        priceAinB,
        priceBinA,
        tvlLabel: `${formatToken(reserveARaw, 18, 2)} TKA / ${formatToken(
          reserveBRaw,
          18,
          2
        )} TKB`,
        hasLiquidity,
      });
    } catch (err) {
      console.error(err);
      setError(err.shortMessage || err.message || "Không đọc được AMM data.");
    } finally {
      setLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    loading,
    error,
    reload,
  };
}