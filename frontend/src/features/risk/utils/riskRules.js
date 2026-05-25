function toNumber(value) {
  const n = Number(String(value || "0").replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
}

function maxLevel(a, b) {
  const score = { Normal: 0, Warning: 1, Suspicious: 2 };
  return score[b] > score[a] ? b : a;
}

export function classifyRisk(event, ammData) {
  const reasons = [];
  let level = "Normal";

  const reserveA = toNumber(ammData?.reserveA);
  const reserveB = toNumber(ammData?.reserveB);

  const amountIn = event.amountInNumber ?? toNumber(event.primary);
  const amountOut = event.amountOutNumber ?? toNumber(event.secondary);

  if (event.type === "FAILED") {
    return {
      level: "Suspicious",
      score: 95,
      reasons: [
        event.reason || "Failed or reverted transaction attempt.",
        "Failed attempts are important for audit because attackers often probe protocol limits.",
      ],
    };
  }

  if (event.type === "SWAP") {
    const reserveIn =
      event.tokenInSymbol === "DTA" || event.primary?.includes("DTA")
        ? reserveA
        : reserveB;

    const poolShare = reserveIn > 0 ? (amountIn / reserveIn) * 100 : 0;

    if (poolShare >= 30) {
      level = maxLevel(level, "Suspicious");
      reasons.push(
        `Swap input is ${poolShare.toFixed(
          2
        )}% of current reserve. This can heavily move AMM price.`
      );
    } else if (poolShare >= 10) {
      level = maxLevel(level, "Warning");
      reasons.push(
        `Swap input is ${poolShare.toFixed(
          2
        )}% of current reserve. Auditor should inspect price impact.`
      );
    }

    const executionRatio = amountIn > 0 ? amountOut / amountIn : 0;

    if (executionRatio <= 0) {
      level = maxLevel(level, "Warning");
      reasons.push("Swap output could not be estimated from event data.");
    }
  }

  if (event.type === "REMOVE") {
    const amountA = amountIn;
    const amountB = amountOut;

    const shareA = reserveA > 0 ? (amountA / reserveA) * 100 : 0;
    const shareB = reserveB > 0 ? (amountB / reserveB) * 100 : 0;
    const maxShare = Math.max(shareA, shareB);

    if (maxShare >= 30) {
      level = maxLevel(level, "Suspicious");
      reasons.push(
        `Liquidity withdrawal is about ${maxShare.toFixed(
          2
        )}% of current reserve. Pool depth may be significantly reduced.`
      );
    } else if (maxShare >= 10) {
      level = maxLevel(level, "Warning");
      reasons.push(
        `Liquidity withdrawal is about ${maxShare.toFixed(
          2
        )}% of current reserve.`
      );
    }
  }

  if (event.type === "EVIDENCE" && !event.evidenceURI) {
    level = maxLevel(level, "Warning");
    reasons.push("Evidence event is missing URI.");
  }

  if (reasons.length === 0) {
    reasons.push("No suspicious pattern detected by current rule set.");
  }

  const score = level === "Suspicious" ? 85 : level === "Warning" ? 55 : 15;

  return { level, score, reasons };
}

export function riskTone(level) {
  if (level === "Suspicious") {
    return {
      pill: "border-red-300 bg-red-500/10 text-red-500",
      card: "border-red-400/50 bg-red-500/5",
    };
  }

  if (level === "Warning") {
    return {
      pill: "border-amber-300 bg-amber-500/10 text-amber-500",
      card: "border-amber-400/50 bg-amber-500/5",
    };
  }

  return {
    pill: "border-emerald-300 bg-emerald-500/10 text-emerald-500",
    card: "border-[var(--border)] bg-[var(--surface-soft)]",
  };
}