import { useCallback, useEffect, useState } from "react";
import { getAMM, getStakingRewards } from "../lib/contracts";
import { formatToken, shortAddress } from "../lib/format";

function safeFormat(value) {
  try {
    return formatToken(value, 18, 4);
  } catch {
    return "0";
  }
}

function createActivity(log, payload) {
  return {
    id: `${log.transactionHash}-${log.index}`,
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
    ...payload,
  };
}

function mapSwapEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "SWAP",
    title: "Swap Tokens",
    user: shortAddress(args.trader),
    primary: `${safeFormat(args.amountIn)} in`,
    secondary: `${safeFormat(args.amountOut)} out`,
    description: "Token swap through AMM pool",
  });
}

function mapAddLiquidityEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "ADD",
    title: "Add Liquidity",
    user: shortAddress(args.provider),
    primary: `${safeFormat(args.amountA)} TKA`,
    secondary: `${safeFormat(args.amountB)} TKB`,
    description: "Liquidity added to AMM pool",
  });
}

function mapRemoveLiquidityEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "REMOVE",
    title: "Remove Liquidity",
    user: shortAddress(args.provider),
    primary: `${safeFormat(args.amountA)} TKA`,
    secondary: `${safeFormat(args.amountB)} TKB`,
    description: "Liquidity removed from AMM pool",
  });
}

function mapStakeEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "STAKE",
    title: "Stake LP",
    user: shortAddress(args.user),
    primary: `${safeFormat(args.amount)} ALP`,
    secondary: "Staked",
    description: "LP tokens staked into farm",
  });
}

function mapWithdrawStakeEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "UNSTAKE",
    title: "Withdraw LP",
    user: shortAddress(args.user),
    primary: `${safeFormat(args.amount)} ALP`,
    secondary: "Withdrawn",
    description: "LP tokens withdrawn from farm",
  });
}

function mapRewardPaidEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "CLAIM",
    title: "Claim Reward",
    user: shortAddress(args.user),
    primary: `${safeFormat(args.reward)} DRX`,
    secondary: "Claimed",
    description: "DRX farming reward claimed",
  });
}

export default function useSystemEvents(provider, refreshKey = 0, limit = 8) {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const reloadEvents = useCallback(async () => {
    if (!provider) {
      setEvents([]);
      setAllEvents([]);
      return;
    }

    try {
      setLoading(true);

      const amm = getAMM(provider);
      const stakingRewards = getStakingRewards(provider);

      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 5000, 0);

      const [
        swapLogs,
        addLogs,
        removeLogs,
        stakeLogs,
        withdrawStakeLogs,
        rewardPaidLogs,
      ] = await Promise.all([
        amm.queryFilter(amm.filters.Swapped(), fromBlock, latestBlock),
        amm.queryFilter(amm.filters.LiquidityAdded(), fromBlock, latestBlock),
        amm.queryFilter(amm.filters.LiquidityRemoved(), fromBlock, latestBlock),
        stakingRewards.queryFilter(
          stakingRewards.filters.Staked(),
          fromBlock,
          latestBlock
        ),
        stakingRewards.queryFilter(
          stakingRewards.filters.Withdrawn(),
          fromBlock,
          latestBlock
        ),
        stakingRewards.queryFilter(
          stakingRewards.filters.RewardPaid(),
          fromBlock,
          latestBlock
        ),
      ]);

      const mergedEvents = [
        ...swapLogs.map(mapSwapEvent),
        ...addLogs.map(mapAddLiquidityEvent),
        ...removeLogs.map(mapRemoveLiquidityEvent),
        ...stakeLogs.map(mapStakeEvent),
        ...withdrawStakeLogs.map(mapWithdrawStakeEvent),
        ...rewardPaidLogs.map(mapRewardPaidEvent),
      ].sort((a, b) => b.blockNumber - a.blockNumber);

      setAllEvents(mergedEvents);
      setEvents(mergedEvents.slice(0, limit));
    } catch (error) {
      console.error("Load system events failed:", error);
      setEvents([]);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, [provider, limit]);

  useEffect(() => {
    reloadEvents();
  }, [reloadEvents, refreshKey]);

  return {
    events,
    allEvents,
    loading,
    reloadEvents,
  };
}