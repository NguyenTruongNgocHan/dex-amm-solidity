import { useMemo, useState } from "react";
import { ethers } from "ethers";
import SurfaceCard from "../../components/common/SurfaceCard";
import TokenAmountInput from "../../components/common/TokenAmountInput";
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
  { label: "0.5% - Tight protection", value: 50 },
  { label: "1% - Recommended", value: 100 },
  { label: "2% - Volatile pool", value: 200 },
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

  const poolPriceLabel = isAToB
    ? `1 ${SYMBOLS.tokenA} = ${ammData.priceAinB} ${SYMBOLS.tokenB}`
    : `1 ${SYMBOLS.tokenB} = ${ammData.priceBinA} ${SYMBOLS.tokenA}`;

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
        amountInRaw,
        amountOutRaw,
        minOutRaw,
        estimatedOut: formatQuote(amountOutRaw),
        minReceived: formatQuote(minOutRaw),
        minReceivedRaw: ethers.formatUnits(minOutRaw, 18),
        slippagePercent: formatBpsToPercent(slippageBps),
        priceImpact: `${priceImpactNumber.toFixed(2)}%`,
        priceImpactNumber,
      };
    } catch {
      return emptyQuote();
    }
  }, [amount, ammData.hasLiquidity, reserveInRaw, reserveOutRaw, slippageBps]);

  const impactTone = getPriceImpactTone(quote.priceImpactNumber);

  function selectDirection(nextDirection) {
    setDirection(nextDirection);
    setAmount("100");
  }

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
    <SurfaceCard className="flex h-full flex-col p-5">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => selectDirection(DIRECTIONS.A_TO_B)}
          className={
            isAToB
              ? "rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
              : "rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
          }
        >
          Swap {SYMBOLS.tokenA} → {SYMBOLS.tokenB}
        </button>

        <button
          type="button"
          onClick={() => selectDirection(DIRECTIONS.B_TO_A)}
          className={
            !isAToB
              ? "rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
              : "rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
          }
        >
          Swap {SYMBOLS.tokenB} → {SYMBOLS.tokenA}
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-[16px] font-bold text-[var(--text)]">
          Swap {inputSymbol} → {outputSymbol}
        </h3>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          Price is calculated from pool reserves using the constant product AMM
          model. Every swap changes the reserves, so the execution price can
          move before the transaction is confirmed.
        </p>
      </div>

      <div className="mt-5">
        <TokenAmountInput
          label="Amount to swap"
          value={amount}
          onChange={setAmount}
          symbol={inputSymbol}
          helper="This is the exact input amount sent to the AMM pool."
        />
      </div>

      <QuoteBox
        quote={quote}
        impactTone={impactTone}
        inputSymbol={inputSymbol}
        outputSymbol={outputSymbol}
        poolPriceLabel={poolPriceLabel}
      />

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-[var(--text)]">
            Slippage tolerance (%)
          </label>

          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
            Current: {quote.slippagePercent}
          </span>
        </div>

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

        <div className="mt-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
          Slippage tolerance is the maximum price movement you accept before
          the transaction reverts. Example: if the quote is 100{" "}
          {outputSymbol} and slippage is 1%, the smart contract requires at
          least 99 {outputSymbol}. If the pool price changes too much, the swap
          fails and state is rolled back.
        </div>
      </div>

      {quote.priceImpactNumber >= 5 ? (
        <div className="mt-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          High price impact. This trade changes the pool reserve ratio
          noticeably. Consider reducing the input amount or adding more
          liquidity first.
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSwap}
        disabled={
          trade?.pending ||
          !ammData.hasLiquidity ||
          !amount ||
          Number(amount) <= 0
        }
        className="mt-auto w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!connected
          ? "Connect Wallet"
          : trade?.pending
          ? "Processing..."
          : !ammData.hasLiquidity
          ? "Pool is Empty"
          : `Swap ${inputSymbol}`}
      </button>
    </SurfaceCard>
  );
}

function QuoteBox({
  quote,
  impactTone,
  inputSymbol,
  outputSymbol,
  poolPriceLabel,
}) {
  return (
    <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
      <div className="text-sm text-[var(--muted)]">Estimated output</div>

      <div className="mt-2 text-[30px] font-bold leading-none text-teal-600 dark:text-teal-300">
        {quote.estimatedOut} {outputSymbol}
      </div>

      <div className="mt-4 grid gap-2">
        <InfoRow label="Route" value={`${inputSymbol} → ${outputSymbol}`} />
        <InfoRow label="Pool spot price" value={poolPriceLabel} />
        <InfoRow label="Trading fee" value="0.3%" />
        <InfoRow
          label="Price impact"
          value={quote.priceImpact}
          tone={impactTone}
        />
        <InfoRow
          label="Slippage tolerance"
          value={quote.slippagePercent}
          tone="warning"
        />
        <InfoRow
          label="Minimum received"
          value={`${quote.minReceived} ${outputSymbol}`}
          tone="success"
        />
      </div>

      <div className="mt-4 rounded-[14px] bg-white/60 px-4 py-3 text-xs leading-5 text-teal-800 dark:bg-white/5 dark:text-teal-200">
        Minimum received is sent to the smart contract as{" "}
        <span className="font-bold">minAmountOut</span>. If the actual output is
        lower than this value, the transaction reverts automatically.
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
    amountInRaw: 0n,
    amountOutRaw: 0n,
    minOutRaw: 0n,
    estimatedOut: "0",
    minReceived: "0",
    minReceivedRaw: "0",
    slippagePercent: "0%",
    priceImpact: "0.00%",
    priceImpactNumber: 0,
  };
}