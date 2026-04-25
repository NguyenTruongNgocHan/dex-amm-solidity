import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getAMM } from "../lib/contracts";
import { formatToken, shortAddress } from "../lib/format";

function safeFormat(value) {
  try {
    return formatToken(value, 18, 4);
  } catch {
    return "0";
  }
}

function eventToActivity(log, type) {
  const args = log.args;

  if (type === "swap") {
    return {
      id: `${log.transactionHash}-${log.index}`,
      type: "SWAP",
      title: "Swap",
      user: shortAddress(args.trader),
      primary: `${safeFormat(args.amountIn)} in`,
      secondary: `${safeFormat(args.amountOut)} out`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    };
  }

  if (type === "add") {
    return {
      id: `${log.transactionHash}-${log.index}`,
      type: "ADD",
      title: "Add Liquidity",
      user: shortAddress(args.provider),
      primary: `${safeFormat(args.amountA)} TKA`,
      secondary: `${safeFormat(args.amountB)} TKB`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    };
  }

  return {
    id: `${log.transactionHash}-${log.index}`,
    type: "REMOVE",
    title: "Remove Liquidity",
    user: shortAddress(args.provider),
    primary: `${safeFormat(args.amountA)} TKA`,
    secondary: `${safeFormat(args.amountB)} TKB`,
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  };
}

export default function useAMMEvents(provider, refreshKey = 0) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const reloadEvents = useCallback(async () => {
    if (!provider) {
      setEvents([]);
      return;
    }

    try {
      setLoading(true);

      const amm = getAMM(provider);
      const latestBlock = await provider.getBlockNumber();

      const fromBlock = Math.max(latestBlock - 5000, 0);

      const [swapLogs, addLogs, removeLogs] = await Promise.all([
        amm.queryFilter(amm.filters.Swapped(), fromBlock, latestBlock),
        amm.queryFilter(amm.filters.LiquidityAdded(), fromBlock, latestBlock),
        amm.queryFilter(amm.filters.LiquidityRemoved(), fromBlock, latestBlock),
      ]);

      const activities = [
        ...swapLogs.map((log) => eventToActivity(log, "swap")),
        ...addLogs.map((log) => eventToActivity(log, "add")),
        ...removeLogs.map((log) => eventToActivity(log, "remove")),
      ]
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 8);

      setEvents(activities);
    } catch (error) {
      console.error("Load AMM events failed:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    reloadEvents();
  }, [reloadEvents, refreshKey]);

  return {
    events,
    loading,
    reloadEvents,
  };
}