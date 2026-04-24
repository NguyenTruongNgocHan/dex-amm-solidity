import { useCallback, useEffect, useState } from "react";
import { getAMM, getLPToken, getTokenA, getTokenB } from "../lib/contracts";
import { formatToken } from "../lib/format";

export default function useAMMData(provider, signer, address) {
  const [data, setData] = useState({
    reserveA: "0",
    reserveB: "0",
    tokenABalance: "0",
    tokenBBalance: "0",
    lpBalance: "0",
    lpTokenAddress: "",
    priceAinB: "0",
  });

  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!provider) return;

    try {
      setLoading(true);

      const amm = getAMM(provider);
      const tokenA = getTokenA(provider);
      const tokenB = getTokenB(provider);

      const [reserveA, reserveB, lpTokenAddress] = await Promise.all([
        amm.reserveA(),
        amm.reserveB(),
        amm.lpToken(),
      ]);

      let tokenABalance = 0n;
      let tokenBBalance = 0n;
      let lpBalance = 0n;

      if (address) {
        const lpToken = getLPToken(lpTokenAddress, provider);

        [tokenABalance, tokenBBalance, lpBalance] = await Promise.all([
          tokenA.balanceOf(address),
          tokenB.balanceOf(address),
          lpToken.balanceOf(address),
        ]);
      }

      const reserveANum = Number(formatToken(reserveA, 18, 6));
      const reserveBNum = Number(formatToken(reserveB, 18, 6));
      const priceAinB =
        reserveANum > 0 && reserveBNum > 0
          ? (reserveBNum / reserveANum).toFixed(4)
          : "0";

      setData({
        reserveA: formatToken(reserveA),
        reserveB: formatToken(reserveB),
        tokenABalance: formatToken(tokenABalance),
        tokenBBalance: formatToken(tokenBBalance),
        lpBalance: formatToken(lpBalance),
        lpTokenAddress,
        priceAinB,
      });
    } catch (error) {
      console.error(error);
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
    reload,
  };
}