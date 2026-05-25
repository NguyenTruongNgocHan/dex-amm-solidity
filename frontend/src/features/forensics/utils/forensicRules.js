function toNumber(value) {
  const n = Number(String(value || "0").replaceAll(",", "").split(" ")[0]);
  return Number.isFinite(n) ? n : 0;
}

function createSignal({
  type,
  level,
  title,
  description,
  actor,
  txHash,
  blockNumber,
  evidence,
  recommendation,
}) {
  return {
    id: `${type}-${txHash || blockNumber || Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`,
    type,
    level,
    title,
    description,
    actor: actor || "Unknown",
    txHash: txHash || "N/A",
    blockNumber: blockNumber || "N/A",
    evidence: evidence || [],
    recommendation:
      recommendation ||
      "Auditor should inspect related on-chain events and evidence receipts.",
  };
}

export function buildForensicSignals(events, failedTransactions, ammData) {
  const reserveA = toNumber(ammData?.reserveA);
  const reserveB = toNumber(ammData?.reserveB);
  const signals = [];

  for (const event of events) {
    if (event.type === "SWAP") {
      const amountIn = event.amountInNumber ?? toNumber(event.primary);
      const reserveIn =
        event.tokenInSymbol === "DTA" || event.primary?.includes("DTA")
          ? reserveA
          : reserveB;

      const reserveShare = reserveIn > 0 ? (amountIn / reserveIn) * 100 : 0;

      if (reserveShare >= 20) {
        signals.push(
          createSignal({
            type: "WHALE_SWAP",
            level: reserveShare >= 30 ? "Critical" : "High",
            title: "Whale swap detected",
            description: `Swap input equals ${reserveShare.toFixed(
              2
            )}% of current pool reserve.`,
            actor: event.user,
            txHash: event.txHash,
            blockNumber: event.blockNumber,
            evidence: [
              `Amount: ${event.primary}`,
              `Output: ${event.secondary}`,
              `Reserve share: ${reserveShare.toFixed(2)}%`,
            ],
            recommendation:
              "Check price impact, slippage setting, and related follow-up swaps.",
          })
        );
      }
    }

    if (event.type === "REMOVE") {
      const amountA = event.amountInNumber ?? toNumber(event.primary);
      const amountB = event.amountOutNumber ?? toNumber(event.secondary);

      const shareA = reserveA > 0 ? (amountA / reserveA) * 100 : 0;
      const shareB = reserveB > 0 ? (amountB / reserveB) * 100 : 0;
      const maxShare = Math.max(shareA, shareB);

      if (maxShare >= 20) {
        signals.push(
          createSignal({
            type: "LIQUIDITY_DRAIN",
            level: maxShare >= 40 ? "Critical" : "High",
            title: "Liquidity drain warning",
            description: `Liquidity withdrawal is approximately ${maxShare.toFixed(
              2
            )}% of current reserve.`,
            actor: event.user,
            txHash: event.txHash,
            blockNumber: event.blockNumber,
            evidence: [
              `Token A out: ${event.primary}`,
              `Token B out: ${event.secondary}`,
              `Reserve impact: ${maxShare.toFixed(2)}%`,
            ],
            recommendation:
              "Inspect whether the liquidity removal affects pool stability or follows suspicious swaps.",
          })
        );
      }
    }

    if (event.type === "EVIDENCE" && !event.evidenceURI) {
      signals.push(
        createSignal({
          type: "EVIDENCE_GAP",
          level: "Medium",
          title: "Incomplete evidence record",
          description: "Evidence event exists but does not include a valid URI.",
          actor: event.user,
          txHash: event.txHash,
          blockNumber: event.blockNumber,
          evidence: [`Subject: ${event.subject || "N/A"}`],
          recommendation:
            "Require operator/auditor to submit a complete IPFS evidence record.",
        })
      );
    }
  }

  const failedByReason = new Map();

  for (const failed of failedTransactions) {
    const key = `${failed.user || "unknown"}-${failed.reason || "failed"}`;
    failedByReason.set(key, (failedByReason.get(key) || 0) + 1);

    signals.push(
      createSignal({
        type: "FAILED_ATTEMPT",
        level: "High",
        title: "Failed transaction attempt",
        description:
          failed.reason ||
          "Frontend captured a failed or reverted transaction attempt.",
        actor: failed.user,
        txHash: failed.id,
        blockNumber: "N/A",
        evidence: [
          `Action: ${failed.title || failed.type}`,
          `Amount: ${failed.amountIn || "N/A"}`,
          `Pair: ${failed.tokenIn || "?"} → ${failed.tokenOut || "?"}`,
        ],
        recommendation:
          "Failed attempts may indicate users probing limits, slippage, balance, or policy restrictions.",
      })
    );
  }

  for (const [key, count] of failedByReason.entries()) {
    if (count >= 3) {
      signals.push(
        createSignal({
          type: "REPEATED_FAILURE",
          level: "Critical",
          title: "Repeated failed attempts",
          description: `${count} failed attempts share the same actor/reason pattern.`,
          actor: key.split("-")[0],
          txHash: "local-failed-pattern",
          blockNumber: "N/A",
          evidence: [`Pattern key: ${key}`, `Failure count: ${count}`],
          recommendation:
            "Auditor should inspect whether this is accidental usage or active probing.",
        })
      );
    }
  }

  return signals;
}

export function buildForensicTimeline(events, failedTransactions) {
  const onChainItems = events.map((event) => ({
    id: event.id,
    source: "on-chain",
    type: event.type,
    title: event.title,
    actor: event.user,
    txHash: event.txHash,
    blockNumber: event.blockNumber,
    description: event.description || event.secondary,
    order: event.order || 0,
  }));

  const failedItems = failedTransactions.map((event, index) => ({
    id: event.id,
    source: "frontend-guard",
    type: "FAILED",
    title: event.title || "Failed transaction",
    actor: event.user || "Local wallet",
    txHash: event.id,
    blockNumber: "N/A",
    description: event.reason || "Failed transaction attempt.",
    order: Date.parse(event.createdAt || "") || index,
  }));

  return [...failedItems, ...onChainItems].sort(
    (a, b) => Number(b.order || 0) - Number(a.order || 0)
  );
}

export function summarizeSignals(signals) {
  return signals.reduce(
    (acc, signal) => {
      acc.total += 1;
      acc[signal.level] += 1;
      return acc;
    },
    { total: 0, Critical: 0, High: 0, Medium: 0, Low: 0 }
  );
}