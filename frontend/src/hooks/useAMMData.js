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
  lpTokenAddress: "",
  priceAinB: "0",
  priceBinA: "0",
  tvlLabel: "0",
  hasLiquidity: false,
};

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

      const [reserveARaw, reserveBRaw, lpTokenAddress] = await Promise.all([
        amm.reserveA(),
        amm.reserveB(),
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

      const reserveANum = Number(formatToken(reserveARaw, 18, 8).replaceAll(",", ""));
      const reserveBNum = Number(formatToken(reserveBRaw, 18, 8).replaceAll(",", ""));

      const hasLiquidity = reserveANum > 0 && reserveBNum > 0;

      const priceAinB = hasLiquidity
        ? (reserveBNum / reserveANum).toFixed(4)
        : "0";

      const priceBinA = hasLiquidity
        ? (reserveANum / reserveBNum).toFixed(4)
        : "0";

      setData({
        reserveA: formatToken(reserveARaw),
        reserveB: formatToken(reserveBRaw),
        reserveARaw,
        reserveBRaw,
        tokenABalance: formatToken(tokenABalanceRaw),
        tokenBBalance: formatToken(tokenBBalanceRaw),
        lpBalance: formatToken(lpBalanceRaw),
        lpTokenAddress,
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