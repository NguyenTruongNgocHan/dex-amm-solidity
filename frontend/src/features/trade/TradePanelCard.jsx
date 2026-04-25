import { useMemo, useState } from "react";
import { ethers } from "ethers";
import SurfaceCard from "../../components/common/SurfaceCard";
import { getAmountOut, applySlippage, formatQuote } from "../../lib/ammMath";
import { parseToken } from "../../lib/format";

const SLIPPAGE_OPTIONS = [
  { label: "0.5%", value: 50 },
  { label: "1% - Recommended", value: 100 },
  { label: "2%", value: 200 },
  { label: "3%", value: 300 },
];

export default function TradePanelCard({
  ammData,
  connected,
  onConnect,
  trade,
}) {
  const [amount, setAmount] = useState("100");
  const [slippageBps, setSlippageBps] = useState(100);

  const quote = useMemo(() => {
    try {
      if (!ammData.hasLiquidity) {
        return emptyQuote();
      }

      const amountInRaw = parseToken(amount || "0");

      const amountOutRaw = getAmountOut(
        amountInRaw,
        ammData.reserveARaw,
        ammData.reserveBRaw
      );

      const minOutRaw = applySlippage(amountOutRaw, slippageBps);

      const inputNum = Number(amount || "0");
      const reserveANum = Number(ethers.formatUnits(ammData.reserveARaw, 18));
      const reserveBNum = Number(ethers.formatUnits(ammData.reserveBRaw, 18));
      const outputNum = Number(ethers.formatUnits(amountOutRaw, 18));

      const spotPrice = reserveBNum / reserveANum;
      const executionPrice = inputNum > 0 ? outputNum / inputNum : 0;

      const priceImpactNumber =
        spotPrice > 0
          ? ((spotPrice - executionPrice) / spotPrice) * 100
          : 0;

      return {
        amountOutRaw,
        minOutRaw,
        estimatedOut: formatQuote(amountOutRaw),
        minReceived: formatQuote(minOutRaw),
        priceImpact: `${priceImpactNumber.toFixed(2)}%`,
        priceImpactNumber,
      };
    } catch {
      return emptyQuote();
    }
  }, [
    amount,
    ammData.hasLiquidity,
    ammData.reserveARaw,
    ammData.reserveBRaw,
    slippageBps,
  ]);

  const impactTone =
    quote.priceImpactNumber >= 5
      ? "danger"
      : quote.priceImpactNumber >= 1
      ? "warning"
      : "success";

  async function handleSwap() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    await trade.swapTokenAForTokenB(
      amount,
      quote.minReceived.replaceAll(",", "")
    );
  }

  return (
    <SurfaceCard className="p-5">
      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white">
          Buy
        </button>
        <button className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)]">
          Sell
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-[16px] font-bold text-[var(--text)]">
          Swap TokenA → TokenB
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Uses constant product AMM quote with 0.3% fee.
        </p>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          Amount to Spend
        </label>

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-[32px] font-bold leading-none text-[var(--text)] outline-none"
            />
            <div className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold text-[var(--text)]">
              TKA
            </div>
          </div>
        </div>
      </div>

      <QuoteBox
        ammData={ammData}
        quote={quote}
        impactTone={impactTone}
      />

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          Slippage Tolerance
        </label>

        <select
          value={slippageBps}
          onChange={(e) => setSlippageBps(Number(e.target.value))}
          className="w-full rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none"
        >
          {SLIPPAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {quote.priceImpactNumber >= 5 ? (
        <div className="mt-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          High price impact. This trade moves the pool price noticeably.
        </div>
      ) : null}

      <button
        onClick={handleSwap}
        disabled={trade?.pending || !ammData.hasLiquidity}
        className="mt-5 w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!connected
          ? "Connect Wallet"
          : trade?.pending
          ? "Processing..."
          : !ammData.hasLiquidity
          ? "Pool is Empty"
          : "Swap TokenA"}
      </button>
    </SurfaceCard>
  );
}

function QuoteBox({ ammData, quote, impactTone }) {
  return (
    <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
      <div className="text-sm text-[var(--muted)]">Estimated output</div>

      <div className="mt-2 text-[30px] font-bold leading-none text-teal-600 dark:text-teal-300">
        {quote.estimatedOut} TKB
      </div>

      <div className="mt-4 grid gap-2">
        <InfoRow label="Route" value="TKA → TKB" />
        <InfoRow label="Pool price" value={`${ammData.priceAinB} TKB`} />
        <InfoRow label="Trading fee" value="0.3%" />
        <InfoRow
          label="Price impact"
          value={quote.priceImpact}
          tone={impactTone}
        />
        <InfoRow
          label="Minimum received"
          value={`${quote.minReceived} TKB`}
          tone="success"
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`text-right font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function emptyQuote() {
  return {
    amountOutRaw: 0n,
    minOutRaw: 0n,
    estimatedOut: "0",
    minReceived: "0",
    priceImpact: "0.00%",
    priceImpactNumber: 0,
  };
}