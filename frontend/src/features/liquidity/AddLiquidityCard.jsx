import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function AddLiquidityCard({
  connected,
  onConnect,
  ammData,
  liquidity,
}) {
  const [amountA, setAmountA] = useState("100");
  const [amountB, setAmountB] = useState("100");

  const poolRatio = useMemo(() => {
    if (!ammData.hasLiquidity) return "First deposit sets pool ratio";
    return `Current ratio: 1 TKA = ${ammData.priceAinB} TKB`;
  }, [ammData.hasLiquidity, ammData.priceAinB]);

  async function handleAddLiquidity() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    await liquidity.addLiquidity(amountA, amountB);
  }

  return (
    <SurfaceCard className="p-5">
      <div>
        <h3 className="text-[18px] font-bold text-[var(--text)]">
          Add Liquidity
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Deposit TokenA and TokenB into the AMM pool.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <TokenInput
          label="TokenA Amount"
          symbol="TKA"
          value={amountA}
          onChange={setAmountA}
        />

        <TokenInput
          label="TokenB Amount"
          symbol="TKB"
          value={amountB}
          onChange={setAmountB}
        />
      </div>

      <div className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <InfoRow label="Pool ratio" value={poolRatio} />
        <InfoRow label="LP Token" value="Minted after deposit" />
        <InfoRow label="Action" value="approve → addLiquidity" tone="success" />
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={liquidity.pending}
        className="mt-5 w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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

function TokenInput({ label, symbol, value, onChange }) {
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
      <span className={`max-w-[220px] truncate text-right font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
}