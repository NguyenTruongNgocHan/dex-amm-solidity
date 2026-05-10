import { useCallback, useEffect, useState } from "react";
import { getAMM, getStakingRewards } from "../lib/contracts";
import { formatToken, shortAddress } from "../lib/format";
import { getTradeReceipts } from "../lib/ipfs";

function safeFormat(value, max = 4) {
  try {
    return formatToken(value, 18, max);
  } catch {
    return "0";
  }
}

function eventOrder(log) {
  return Number(log.blockNumber || 0) * 100000 + Number(log.index || 0);
}

function createActivity(log, payload) {
  return {
    id: `${log.transactionHash}-${log.index}`,
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
    logIndex: log.index,
    order: eventOrder(log),
    source: "on-chain",
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
    tokenIn: args.tokenIn,
    tokenOut: args.tokenOut,
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

function mapLocalTradeReceipt(receipt, index) {
  const createdAtTime = receipt.createdAt
    ? new Date(receipt.createdAt).getTime()
    : Date.now() - index;

  return {
    id: `local-swap-${receipt.txHash || index}`,
    type: "SWAP",
    title: "Swap Tokens",
    user: shortAddress(receipt.trader),
    primary: `${receipt.amountIn} ${receipt.tokenIn}`,
    secondary: `${receipt.tokenOut}`,
    description: "Swap receipt saved off-chain after successful trade",
    txHash: receipt.txHash,
    blockNumber: receipt.blockNumber || "-",
    logIndex: 9999,
    order: createdAtTime,
    source: "receipt",
  };
}

async function querySafely(contract, filter, fromBlock, latestBlock, mapper) {
  try {
    const logs = await contract.queryFilter(filter, fromBlock, latestBlock);
    return logs.map(mapper);
  } catch (error) {
    console.error("Event query failed:", error);
    return [];
  }
}

function mergeAndDedupe(events) {
  const seen = new Set();
  const result = [];

  for (const event of events) {
    const key = `${event.type}-${event.txHash}`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(event);
  }

  return result.sort((a, b) => b.order - a.order);
}

export default function useSystemEvents(provider, refreshKey = 0, limit = 8) {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const reloadEvents = useCallback(async () => {
    if (!provider) {
      const localSwaps = getTradeReceipts().map(mapLocalTradeReceipt);
      const fallbackEvents = mergeAndDedupe(localSwaps);

      setAllEvents(fallbackEvents);
      setEvents(fallbackEvents.slice(0, limit));
      return;
    }

    try {
      setLoading(true);

      const amm = getAMM(provider);
      const stakingRewards = getStakingRewards(provider);

      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 10000, 0);

      const [
        swaps,
        adds,
        removes,
        stakes,
        unstakes,
        claims,
      ] = await Promise.all([
        querySafely(
          amm,
          amm.filters.Swapped(),
          fromBlock,
          latestBlock,
          mapSwapEvent
        ),
        querySafely(
          amm,
          amm.filters.LiquidityAdded(),
          fromBlock,
          latestBlock,
          mapAddLiquidityEvent
        ),
        querySafely(
          amm,
          amm.filters.LiquidityRemoved(),
          fromBlock,
          latestBlock,
          mapRemoveLiquidityEvent
        ),
        querySafely(
          stakingRewards,
          stakingRewards.filters.Staked(),
          fromBlock,
          latestBlock,
          mapStakeEvent
        ),
        querySafely(
          stakingRewards,
          stakingRewards.filters.Withdrawn(),
          fromBlock,
          latestBlock,
          mapWithdrawStakeEvent
        ),
        querySafely(
          stakingRewards,
          stakingRewards.filters.RewardPaid(),
          fromBlock,
          latestBlock,
          mapRewardPaidEvent
        ),
      ]);

      const localSwaps = getTradeReceipts().map(mapLocalTradeReceipt);

      const mergedEvents = mergeAndDedupe([
        ...swaps,
        ...adds,
        ...removes,
        ...stakes,
        ...unstakes,
        ...claims,
        ...localSwaps,
      ]);

      setAllEvents(mergedEvents);
      setEvents(mergedEvents.slice(0, limit));
    } catch (error) {
      console.error("Load system events failed:", error);

      const localSwaps = getTradeReceipts().map(mapLocalTradeReceipt);
      const fallbackEvents = mergeAndDedupe(localSwaps);

      setAllEvents(fallbackEvents);
      setEvents(fallbackEvents.slice(0, limit));
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