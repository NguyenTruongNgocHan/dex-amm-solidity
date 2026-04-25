import { useEffect, useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";
import {
  calculateLiquidityPreview,
  calculatePairedAmount,
  isValidLiquidityInput,
} from "../../lib/liquidityMath";

export default function AddLiquidityCard({
  connected,
  onConnect,
  ammData,
  liquidity,
}) {
  const [amountA, setAmountA] = useState("100");
  const [amountB, setAmountB] = useState("100");
  const [lastEdited, setLastEdited] = useState("A");

  const isExistingPool = ammData.hasLiquidity;

  useEffect(() => {
    if (!isExistingPool) return;

    if (lastEdited === "A") {
      const pairedB = calculatePairedAmount(
        amountA,
        ammData.reserveARaw,
        ammData.reserveBRaw
      );

      setAmountB(pairedB);
    }

    if (lastEdited === "B") {
      const pairedA = calculatePairedAmount(
        amountB,
        ammData.reserveBRaw,
        ammData.reserveARaw
      );

      setAmountA(pairedA);
    }
  }, [
    amountA,
    amountB,
    lastEdited,
    isExistingPool,
    ammData.reserveARaw,
    ammData.reserveBRaw,
  ]);

  const lpPreview = useMemo(() => {
    return calculateLiquidityPreview(
      amountA,
      amountB,
      ammData.reserveARaw,
      ammData.reserveBRaw,
      ammData.lpBalance
    );
  }, [
    amountA,
    amountB,
    ammData.reserveARaw,
    ammData.reserveBRaw,
    ammData.lpBalance,
  ]);

  const canSubmit =
    connected &&
    !liquidity.pending &&
    isValidLiquidityInput(amountA, amountB);

  async function handleAddLiquidity() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    if (!isValidLiquidityInput(amountA, amountB)) return;

    await liquidity.addLiquidity(amountA, amountB);
  }

  function handleAmountA(value) {
    setLastEdited("A");
    setAmountA(value);
  }

  function handleAmountB(value) {
    setLastEdited("B");
    setAmountB(value);
  }

  return (
    <SurfaceCard className="p-5">
      <div>
        <h3 className="text-[18px] font-bold text-[var(--text)]">
          Add Liquidity
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Deposit tokens into the pool using the current AMM ratio.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <TokenInput
          label="TokenA Amount"
          symbol="TKA"
          value={amountA}
          onChange={handleAmountA}
        />

        <TokenInput
          label="TokenB Amount"
          symbol="TKB"
          value={amountB}
          onChange={handleAmountB}
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
              ? `1 TKA = ${ammData.priceAinB} TKB`
              : "Not set yet"
          }
        />
        <InfoRow label="LP preview" value={`~ ${lpPreview} LPT`} />
        <InfoRow label="Action" value="approve → addLiquidity" tone="success" />
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={connected && !canSubmit}
        className="mt-5 w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!connected
          ? "Connect Wallet"
          : liquidity.pending
          ? "Processing..."
          : !isValidLiquidityInput(amountA, amountB)
          ? "Enter Valid Amounts"
          : "Add Liquidity"}
      </button>
    </SurfaceCard>
  );
}

function TokenInput({ label, symbol, value, onChange, helper }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text)]">
        {label}
      </label>

      <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-[32px] font-bold leading-none text-[var(--text)] outline-none"
          />
          <div className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold text-[var(--text)]">
            {symbol}
          </div>
        </div>
      </div>

      {helper ? (
        <p className="mt-2 text-xs text-[var(--muted)]">{helper}</p>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const color = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
  }[tone];

  return (
    <div className="mt-2 flex items-center justify-between gap-4 text-sm first:mt-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`max-w-[240px] truncate text-right font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
}