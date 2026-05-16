import { useCallback, useEffect, useState } from "react";
import { CONTRACTS, SYMBOLS } from "../config/contracts";
import { getAMM, getStakingRewards } from "../lib/contracts";
import { formatToken, shortAddress } from "../lib/format";

function sameAddress(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function tokenSymbol(address) {
  if (sameAddress(address, CONTRACTS.tokenA)) return SYMBOLS.tokenA;
  if (sameAddress(address, CONTRACTS.tokenB)) return SYMBOLS.tokenB;
  if (sameAddress(address, CONTRACTS.lpToken)) return SYMBOLS.lpToken;
  if (sameAddress(address, CONTRACTS.rewardToken)) return SYMBOLS.rewardToken;
  return "TOKEN";
}

function safeFormat(value, max = 4) {
  try {
    return formatToken(value, 18, max);
  } catch {
    return "0";
  }
}

function logIndex(log) {
  return Number(log.index ?? log.logIndex ?? 0);
}

function eventOrder(log) {
  return Number(log.blockNumber || 0) * 100000 + logIndex(log);
}

function createActivity(log, payload) {
  return {
    id: `${payload.type}-${log.transactionHash}-${logIndex(log)}`,
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
    logIndex: logIndex(log),
    order: eventOrder(log),
    source: "on-chain",
    ...payload,
  };
}

function mapSwapEvent(log) {
  const args = log.args;
  const symbolIn = tokenSymbol(args.tokenIn);
  const symbolOut = tokenSymbol(args.tokenOut);

  return createActivity(log, {
    type: "SWAP",
    title: "Swap Tokens",
    user: shortAddress(args.trader),
    primary: `${safeFormat(args.amountIn)} ${symbolIn}`,
    secondary: `${safeFormat(args.amountOut)} ${symbolOut}`,
    description: `${shortAddress(args.trader)} swapped ${safeFormat(
      args.amountIn,
      6
    )} ${symbolIn} for ${safeFormat(args.amountOut, 6)} ${symbolOut}.`,
  });
}

function mapAddLiquidityEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "ADD",
    title: "Add Liquidity",
    user: shortAddress(args.provider),
    primary: `${safeFormat(args.amountA)} ${SYMBOLS.tokenA}`,
    secondary: `${safeFormat(args.amountB)} ${SYMBOLS.tokenB}`,
    description: `${shortAddress(args.provider)} added ${safeFormat(
      args.amountA,
      6
    )} ${SYMBOLS.tokenA} and ${safeFormat(args.amountB, 6)} ${
      SYMBOLS.tokenB
    }, receiving ${safeFormat(args.liquidityMinted, 6)} ${SYMBOLS.lpToken}.`,
  });
}

function mapRemoveLiquidityEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "REMOVE",
    title: "Remove Liquidity",
    user: shortAddress(args.provider),
    primary: `${safeFormat(args.amountA)} ${SYMBOLS.tokenA}`,
    secondary: `${safeFormat(args.amountB)} ${SYMBOLS.tokenB}`,
    description: `${shortAddress(args.provider)} burned ${safeFormat(
      args.liquidityBurned,
      6
    )} ${SYMBOLS.lpToken} and received ${safeFormat(args.amountA, 6)} ${
      SYMBOLS.tokenA
    } plus ${safeFormat(args.amountB, 6)} ${SYMBOLS.tokenB}.`,
  });
}

function mapStakeEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "STAKE",
    title: "Stake LP",
    user: shortAddress(args.user),
    primary: `${safeFormat(args.amount)} ${SYMBOLS.lpToken}`,
    secondary: "Farm deposit",
    description: `${shortAddress(args.user)} staked ${safeFormat(
      args.amount,
      6
    )} ${SYMBOLS.lpToken} to earn ${SYMBOLS.rewardToken}.`,
  });
}

function mapWithdrawStakeEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "UNSTAKE",
    title: "Withdraw LP",
    user: shortAddress(args.user),
    primary: `${safeFormat(args.amount)} ${SYMBOLS.lpToken}`,
    secondary: "Farm withdraw",
    description: `${shortAddress(args.user)} withdrew ${safeFormat(
      args.amount,
      6
    )} ${SYMBOLS.lpToken} from the farm.`,
  });
}

function mapRewardPaidEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "CLAIM",
    title: "Claim Reward",
    user: shortAddress(args.user),
    primary: `${safeFormat(args.reward)} ${SYMBOLS.rewardToken}`,
    secondary: "Reward claimed",
    description: `${shortAddress(args.user)} claimed ${safeFormat(
      args.reward,
      6
    )} ${SYMBOLS.rewardToken}.`,
  });
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

  return events
    .filter((event) => {
      const key = `${event.txHash}-${event.logIndex}-${event.type}`;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .sort((a, b) => Number(b.order || 0) - Number(a.order || 0));
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
      const fromBlock = Math.max(latestBlock - 10000, 0);

      const [swaps, adds, removes, stakes, unstakes, claims] =
        await Promise.all([
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

      const mergedEvents = mergeAndDedupe([
        ...swaps,
        ...adds,
        ...removes,
        ...stakes,
        ...unstakes,
        ...claims,
      ]);

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