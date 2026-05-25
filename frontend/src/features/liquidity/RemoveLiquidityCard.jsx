import { useMemo, useState } from "react";
import { Flame } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import Button from "../../components/common/Button";
import { SYMBOLS } from "../../config/contracts";
import { calculateRemoveLiquidityPreview } from "../../lib/liquidityMath";

function cleanNumber(value) {
  return String(value || "0").replaceAll(",", "");
}

export default function RemoveLiquidityCard({
  connected,
  onConnect,
  ammData,
  liquidity,
}) {
  const [lpAmount, setLpAmount] = useState("100");

  const preview = useMemo(() => {
    return calculateRemoveLiquidityPreview(
      lpAmount,
      ammData.reserveARaw,
      ammData.reserveBRaw,
      ammData.totalLiquidityRaw
    );
  }, [
    lpAmount,
    ammData.reserveARaw,
    ammData.reserveBRaw,
    ammData.totalLiquidityRaw,
  ]);

  const removePercent = useMemo(() => {
    const lp = Number(cleanNumber(ammData.lpBalance));
    const removing = Number(cleanNumber(lpAmount));

    if (!lp || !removing) return "0.00";

    return Math.min((removing / lp) * 100, 100).toFixed(2);
  }, [ammData.lpBalance, lpAmount]);

  async function handleRemoveLiquidity() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    await liquidity.removeLiquidity(lpAmount);
  }

  function setPercent(percent) {
    const balance = Number(cleanNumber(ammData.lpBalance));

    if (!Number.isFinite(balance) || balance <= 0) {
      setLpAmount("0");
      return;
    }

    setLpAmount(((balance * percent) / 100).toFixed(6).replace(/\.?0+$/, ""));
  }

  return (
    <SurfaceCard
      variant="panel"
      fill
      className="flex min-h-[650px] flex-1 flex-col p-5"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="dex-chip dex-chip-danger">Burn LP</div>

          <h2 className="mt-3 text-2xl font-black text-[var(--text)]">
            Remove Liquidity
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Burn {SYMBOLS.lpToken} and withdraw your reserve share.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--danger-soft)] text-[var(--danger)]">
          <Flame size={22} />
        </div>
      </div>

      <div className="input-shell p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-black text-[var(--muted)]">
            LP Amount
          </label>

          <button
            onClick={() => setLpAmount(cleanNumber(ammData.lpBalance))}
            className="text-xs font-black text-[var(--primary-dark)]"
          >
            MAX
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={lpAmount}
            onChange={(e) => setLpAmount(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-3xl font-black text-[var(--text)] outline-none"
          />

          <span className="rounded-2xl bg-[var(--danger-soft)] px-3 py-2 text-sm font-black text-[var(--danger)]">
            {SYMBOLS.lpToken}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((percent) => (
          <button
            key={percent}
            onClick={() => setPercent(percent)}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-black text-[var(--muted)] transition hover:border-[var(--danger-border)] hover:text-[var(--danger)]"
          >
            {percent === 100 ? "MAX" : `${percent}%`}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--danger-border)] bg-[var(--danger-soft)] p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
          Burn Preview
        </p>

        <p className="mt-2 text-3xl font-black market-down">
          {removePercent}%
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <InfoRow
          label={`Receive ${SYMBOLS.tokenA}`}
          value={`${preview.amountALabel} ${SYMBOLS.tokenA}`}
          tone="success"
        />

        <InfoRow
          label={`Receive ${SYMBOLS.tokenB}`}
          value={`${preview.amountBLabel} ${SYMBOLS.tokenB}`}
          tone="blue"
        />

        <InfoRow
          label="Your LP"
          value={`${connected ? ammData.lpBalance : "—"} ${SYMBOLS.lpToken}`}
        />
      </div>

      <Button
        variant="danger"
        className="mt-auto w-full"
        size="lg"
        disabled={liquidity.pending}
        onClick={handleRemoveLiquidity}
      >
        {!connected
          ? "Connect Wallet"
          : liquidity.pending
          ? "Processing..."
          : "Remove Liquidity"}
      </Button>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const color = {
    success: "market-up",
    blue: "text-[var(--blue)]",
    neutral: "text-[var(--text)]",
  }[tone];

  return (
    <div className="dex-stat flex items-center justify-between gap-4">
      <span className="truncate text-sm font-bold text-[var(--muted)]">
        {label}
      </span>

      <span
        className={`max-w-[170px] truncate text-right text-sm font-black ${color}`}
      >
        {value}
      </span>
    </div>
  );
}