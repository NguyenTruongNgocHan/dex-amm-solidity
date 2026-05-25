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

function evidenceTypeLabel(value) {
  const type = Number(value);

  if (type === 1) return "Trade Receipt";
  if (type === 2) return "Liquidity Receipt";
  if (type === 3) return "Pool Audit Report";
  if (type === 4) return "Governance Proposal";

  return "Evidence";
}

function mapEvidenceAnchoredEvent(log) {
  const args = log.args;

  return createActivity(log, {
    type: "EVIDENCE",
    title: "Evidence Anchored",
    user: shortAddress(args.submitter),
    primary: evidenceTypeLabel(args.evidenceType),
    secondary: String(args.evidenceURI || ""),
    subject: args.subject,
    contentHash: args.contentHash,
    evidenceURI: args.evidenceURI,
    description: `${shortAddress(
      args.submitter
    )} anchored ${evidenceTypeLabel(
      args.evidenceType
    )} with content hash ${String(args.contentHash).slice(0, 12)}...`,
  });
}

function mapSwapEvent(log) {
  const args = log.args;
  const symbolIn = tokenSymbol(args.tokenIn);
  const symbolOut = tokenSymbol(args.tokenOut);

  const amountInLabel = safeFormat(args.amountIn, 6);
  const amountOutLabel = safeFormat(args.amountOut, 6);

  return createActivity(log, {
    type: "SWAP",
    title: "Swap Tokens",
    user: shortAddress(args.trader),
    tokenIn: args.tokenIn,
    tokenOut: args.tokenOut,
    tokenInSymbol: symbolIn,
    tokenOutSymbol: symbolOut,
    amountInRaw: args.amountIn,
    amountOutRaw: args.amountOut,
    amountInNumber: Number(amountInLabel.replaceAll(",", "")),
    amountOutNumber: Number(amountOutLabel.replaceAll(",", "")),
    primary: `${amountInLabel} ${symbolIn}`,
    secondary: `${amountOutLabel} ${symbolOut}`,
    description: `${shortAddress(args.trader)} swapped ${amountInLabel} ${symbolIn} for ${amountOutLabel} ${symbolOut}.`,
  });
}

function mapAddLiquidityEvent(log) {
  const args = log.args;

  const amountALabel = safeFormat(args.amountA, 6);
  const amountBLabel = safeFormat(args.amountB, 6);

  return createActivity(log, {
    type: "ADD",
    title: "Add Liquidity",
    user: shortAddress(args.provider),
    amountInNumber: Number(amountALabel.replaceAll(",", "")),
    amountOutNumber: Number(amountBLabel.replaceAll(",", "")),
    primary: `${amountALabel} ${SYMBOLS.tokenA}`,
    secondary: `${amountBLabel} ${SYMBOLS.tokenB}`,
    description: `${shortAddress(args.provider)} added ${amountALabel} ${SYMBOLS.tokenA} and ${amountBLabel} ${SYMBOLS.tokenB}, receiving ${safeFormat(args.liquidityMinted, 6)} ${SYMBOLS.lpToken}.`,
  });
}

function mapRemoveLiquidityEvent(log) {
  const args = log.args;

  const amountALabel = safeFormat(args.amountA, 6);
  const amountBLabel = safeFormat(args.amountB, 6);

  return createActivity(log, {
    type: "REMOVE",
    title: "Remove Liquidity",
    user: shortAddress(args.provider),
    amountInNumber: Number(amountALabel.replaceAll(",", "")),
    amountOutNumber: Number(amountBLabel.replaceAll(",", "")),
    primary: `${amountALabel} ${SYMBOLS.tokenA}`,
    secondary: `${amountBLabel} ${SYMBOLS.tokenB}`,
    description: `${shortAddress(args.provider)} burned ${safeFormat(args.liquidityBurned, 6)} ${SYMBOLS.lpToken} and received ${amountALabel} ${SYMBOLS.tokenA} plus ${amountBLabel} ${SYMBOLS.tokenB}.`,
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

      const [swaps, adds, removes, evidence, stakes, unstakes, claims] =
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
            amm,
            amm.filters.EvidenceAnchored(),
            fromBlock,
            latestBlock,
            mapEvidenceAnchoredEvent
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
        ...evidence,
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