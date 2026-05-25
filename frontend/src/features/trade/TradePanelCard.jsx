import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";
import TokenAmountInput from "../../components/common/TokenAmountInput";
import Button from "../../components/common/Button";
import {
  applySlippage,
  calculatePriceImpact,
  formatBpsToPercent,
  formatQuote,
  getAmountOut,
  getPriceImpactTone,
} from "../../lib/ammMath";
import { parseToken } from "../../lib/format";
import { SYMBOLS } from "../../config/contracts";

const SLIPPAGE_OPTIONS = [
  { label: "0.5% - Tight", value: 50 },
  { label: "1% - Recommended", value: 100 },
  { label: "2% - Volatile", value: 200 },
  { label: "3% - High risk", value: 300 },
];

const DIRECTIONS = {
  A_TO_B: "A_TO_B",
  B_TO_A: "B_TO_A",
};

export default function TradePanelCard({
  ammData,
  connected,
  onConnect,
  trade,
}) {
  const [amount, setAmount] = useState("100");
  const [slippageBps, setSlippageBps] = useState(100);
  const [direction, setDirection] = useState(DIRECTIONS.A_TO_B);

  const isAToB = direction === DIRECTIONS.A_TO_B;

  const inputSymbol = isAToB ? SYMBOLS.tokenA : SYMBOLS.tokenB;
  const outputSymbol = isAToB ? SYMBOLS.tokenB : SYMBOLS.tokenA;

  const reserveInRaw = isAToB ? ammData.reserveARaw : ammData.reserveBRaw;
  const reserveOutRaw = isAToB ? ammData.reserveBRaw : ammData.reserveARaw;

  const quote = useMemo(() => {
    try {
      if (!ammData.hasLiquidity) return emptyQuote();

      const amountInRaw = parseToken(amount || "0");
      const amountOutRaw = getAmountOut(
        amountInRaw,
        reserveInRaw,
        reserveOutRaw
      );
      const minOutRaw = applySlippage(amountOutRaw, slippageBps);

      const priceImpactNumber = calculatePriceImpact({
        amountInRaw,
        amountOutRaw,
        reserveInRaw,
        reserveOutRaw,
      });

      return {
        estimatedOut: formatQuote(amountOutRaw),
        minReceived: formatQuote(minOutRaw),
        minReceivedRaw:
          String(
            Number(formatQuote(minOutRaw, 18, 18).replaceAll(",", ""))
          ) || "0",
        slippagePercent: formatBpsToPercent(slippageBps),
        priceImpact: `${priceImpactNumber.toFixed(2)}%`,
        priceImpactNumber,
      };
    } catch {
      return emptyQuote();
    }
  }, [amount, ammData.hasLiquidity, reserveInRaw, reserveOutRaw, slippageBps]);

  const impactTone = getPriceImpactTone(quote.priceImpactNumber);

  async function handleSwap() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    if (!amount || Number(amount) <= 0) return;

    if (isAToB) {
      await trade.swapTokenAForTokenB(amount, quote.minReceivedRaw);
    } else {
      await trade.swapTokenBForTokenA(amount, quote.minReceivedRaw);
    }
  }

  return (
    <SurfaceCard
      variant="action"
      fill
      className="flex min-h-[720px] flex-1 flex-col p-5"
    >
      <div className="mb-5">
        <div className="dex-chip">AMM Swap</div>

        <h2 className="mt-3 text-2xl font-black text-[var(--text)]">
          Swap {inputSymbol}
        </h2>

        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          Price is reserve-driven. Slippage only protects minimum output.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-1.5">
        <button
          type="button"
          onClick={() => setDirection(DIRECTIONS.A_TO_B)}
          className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${
            isAToB
              ? "bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Buy {SYMBOLS.tokenB}
        </button>

        <button
          type="button"
          onClick={() => setDirection(DIRECTIONS.B_TO_A)}
          className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${
            !isAToB
              ? "bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Sell {SYMBOLS.tokenB}
        </button>
      </div>

      <div className="mt-5">
        <TokenAmountInput
          label="Amount to spend"
          value={amount}
          onChange={setAmount}
          symbol={inputSymbol}
          helper="This is the exact input amount sent to the AMM pool."
        />
      </div>

      <div className="mt-5 rounded-[24px] border border-[var(--primary-border)] bg-[var(--primary-soft)] p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
          Estimated Output
        </p>

        <div className="mt-2 text-4xl font-black tracking-tight text-[var(--primary-dark)]">
          {quote.estimatedOut} {outputSymbol}
        </div>

        <div className="mt-5 grid gap-2">
          <InfoRow label="Route" value={`${inputSymbol} → ${outputSymbol}`} />
          <InfoRow label="Trading fee" value="0.3%" />
          <InfoRow
            label="Price impact"
            value={quote.priceImpact}
            tone={impactTone}
          />
          <InfoRow
            label="Minimum received"
            value={`${quote.minReceived} ${outputSymbol}`}
            tone="success"
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-black text-[var(--text)]">
            Slippage tolerance (%)
          </label>

          <span className="text-xs font-bold text-[var(--muted)]">
            Current: {quote.slippagePercent}
          </span>
        </div>

        <select
          value={slippageBps}
          onChange={(e) => setSlippageBps(Number(e.target.value))}
          className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
        >
          {SLIPPAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--muted)]">
          Slippage tolerance sets <b>minAmountOut</b>. If the pool reserve ratio
          changes too much before confirmation, the transaction reverts.
        </div>
      </div>

      <Button
        size="lg"
        className="mt-auto w-full"
        onClick={handleSwap}
        disabled={
          trade?.pending ||
          !ammData.hasLiquidity ||
          !amount ||
          Number(amount) <= 0
        }
      >
        {!connected
          ? "Connect Wallet"
          : trade?.pending
          ? "Processing..."
          : !ammData.hasLiquidity
          ? "Pool is Empty"
          : `Swap ${inputSymbol}`}
      </Button>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "market-up",
    warning: "market-warning",
    danger: "market-down",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`text-right font-black ${toneClass}`}>{value}</span>
    </div>
  );
}

function emptyQuote() {
  return {
    estimatedOut: "0",
    minReceived: "0",
    minReceivedRaw: "0",
    slippagePercent: "0%",
    priceImpact: "0.00%",
    priceImpactNumber: 0,
  };
}