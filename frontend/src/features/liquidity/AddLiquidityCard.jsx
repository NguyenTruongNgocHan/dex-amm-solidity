import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";
import TokenAmountInput from "../../components/common/TokenAmountInput";
import { SYMBOLS } from "../../config/contracts";
import {
  calculateLiquidityPreview,
  calculatePairedAmount,
} from "../../lib/liquidityMath";

export default function AddLiquidityCard({
  connected,
  onConnect,
  ammData,
  liquidity,
}) {
  const [amountA, setAmountA] = useState("100");
  const [manualAmountB, setManualAmountB] = useState("100");

  const isExistingPool = Boolean(ammData.hasLiquidity);

  const amountB = useMemo(() => {
    if (!isExistingPool) return manualAmountB;

    return calculatePairedAmount(
      amountA,
      ammData.reserveARaw,
      ammData.reserveBRaw
    );
  }, [
    amountA,
    manualAmountB,
    ammData.reserveARaw,
    ammData.reserveBRaw,
    isExistingPool,
  ]);

  const lpPreview = useMemo(() => {
    return calculateLiquidityPreview(
      amountA,
      amountB,
      ammData.reserveARaw,
      ammData.reserveBRaw,
      ammData.totalLiquidityRaw
    );
  }, [
    amountA,
    amountB,
    ammData.reserveARaw,
    ammData.reserveBRaw,
    ammData.totalLiquidityRaw,
  ]);

  const estimatedNewShare = useMemo(() => {
    const currentShare = Number(ammData.lpSharePercent || 0);
    const currentLP = Number(
      String(ammData.lpBalance || "0").replaceAll(",", "")
    );
    const totalLP = Number(
      String(ammData.totalLiquidity || "0").replaceAll(",", "")
    );
    const mintLP = Number(String(lpPreview || "0").replaceAll(",", ""));

    if (!Number.isFinite(totalLP) || !Number.isFinite(mintLP)) return "0.00";
    if (totalLP + mintLP <= 0) return "100.00";

    const nextShare = ((currentLP + mintLP) / (totalLP + mintLP)) * 100;

    if (!Number.isFinite(nextShare)) return currentShare.toFixed(2);
    return nextShare.toFixed(2);
  }, [
    ammData.lpSharePercent,
    ammData.lpBalance,
    ammData.totalLiquidity,
    lpPreview,
  ]);

  async function handleAddLiquidity() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    await liquidity.addLiquidity(amountA, amountB);
  }

  return (
    <SurfaceCard className="flex h-full flex-col p-5">
      <div>
        <h3 className="text-lg font-bold text-[var(--text)]">Add Liquidity</h3>
        <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
          Deposit tokens into the pool using the current AMM ratio.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <TokenAmountInput
          label={`${SYMBOLS.tokenA} Amount`}
          value={amountA}
          onChange={setAmountA}
          symbol={SYMBOLS.tokenA}
        />

        <TokenAmountInput
          label={`${SYMBOLS.tokenB} Amount`}
          value={amountB}
          onChange={isExistingPool ? () => {} : setManualAmountB}
          symbol={SYMBOLS.tokenB}
          readOnly={isExistingPool}
          helper={
            isExistingPool
              ? "Auto-calculated from pool ratio"
              : "First deposit sets initial pool ratio"
          }
        />
      </div>

      <div className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <InfoRow
          label="Pool mode"
          value={isExistingPool ? "Existing pool" : "Initial deposit"}
        />
        <InfoRow
          label="Current ratio"
          value={
            isExistingPool
              ? `1 ${SYMBOLS.tokenA} = ${ammData.priceAinB} ${SYMBOLS.tokenB}`
              : "Not set yet"
          }
        />
        <InfoRow
          label="LP preview"
          value={`~ ${lpPreview} ${SYMBOLS.lpToken}`}
        />
        <InfoRow
          label="New pool share"
          value={`~ ${estimatedNewShare}%`}
          tone="success"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniInfo
          label={`${SYMBOLS.tokenA} used`}
          value={`${amountA || "0"} ${SYMBOLS.tokenA}`}
        />
        <MiniInfo
          label={`${SYMBOLS.tokenB} used`}
          value={`${amountB || "0"} ${SYMBOLS.tokenB}`}
        />
      </div>

      <div className="mt-4 rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-cyan-300">
          Safety check
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          The transaction uses deadline protection and minimum LP output to
          reduce slippage risk before minting {SYMBOLS.lpToken}.
        </p>
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={liquidity.pending}
        className="mt-auto w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!connected
          ? "Connect Wallet"
          : liquidity.pending
          ? "Processing..."
          : "Add Liquidity"}
      </button>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const color =
    tone === "success" ? "text-[var(--primary)]" : "text-[var(--text)]";

  return (
    <div className="mt-2 flex items-center justify-between gap-4 text-sm first:mt-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`max-w-[210px] truncate text-right font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}