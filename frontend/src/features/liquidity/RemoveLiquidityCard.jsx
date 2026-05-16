import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";
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
  }, [lpAmount, ammData.reserveARaw, ammData.reserveBRaw, ammData.totalLiquidityRaw]);

  const removePercent = useMemo(() => {
    const lp = Number(cleanNumber(ammData.lpBalance));
    const removing = Number(cleanNumber(lpAmount));

    if (!lp || !removing) return "0.00";
    return Math.min((removing / lp) * 100, 100).toFixed(2);
  }, [ammData.lpBalance, lpAmount]);

  const remainingLP = useMemo(() => {
    const current = Number(cleanNumber(ammData.lpBalance));
    const removing = Number(cleanNumber(lpAmount));
    const remaining = Math.max(current - removing, 0);

    return remaining.toLocaleString("en-US", { maximumFractionDigits: 6 });
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

  function useMax() {
    setLpAmount(cleanNumber(ammData.lpBalance));
  }

  return (
    <SurfaceCard className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-bold text-[var(--text)]">
            Remove Liquidity
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Burn {SYMBOLS.lpToken} to withdraw your proportional pool assets.
          </p>
        </div>

        <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-black text-red-400">
          burn
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-[var(--text)]">
            LP Amount
          </label>

          <button
            onClick={useMax}
            className="text-xs font-bold text-[var(--primary-dark)]"
          >
            MAX
          </button>
        </div>

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <input
              value={lpAmount}
              onChange={(e) => setLpAmount(e.target.value)}
              className="w-full bg-transparent text-[28px] font-bold leading-none text-[var(--text)] outline-none"
            />

            <div className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold text-[var(--text)]">
              {SYMBOLS.lpToken}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => setPercent(percent)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-black text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {percent === 100 ? "MAX" : `${percent}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <InfoRow
          label="Your LP"
          value={`${connected ? ammData.lpBalance : "—"} ${SYMBOLS.lpToken}`}
        />
        <InfoRow label="Removing" value={`${removePercent}% of your LP`} />
        <InfoRow
          label={`Receive ${SYMBOLS.tokenA}`}
          value={`${preview.amountALabel} ${SYMBOLS.tokenA}`}
          tone="success"
        />
        <InfoRow
          label={`Receive ${SYMBOLS.tokenB}`}
          value={`${preview.amountBLabel} ${SYMBOLS.tokenB}`}
          tone="success"
        />
        <InfoRow label="Remaining LP" value={`${remainingLP} ${SYMBOLS.lpToken}`} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniInfo
          label={`${SYMBOLS.tokenA} min receive`}
          value={`${preview.amountALabel} ${SYMBOLS.tokenA}`}
        />
        <MiniInfo
          label={`${SYMBOLS.tokenB} min receive`}
          value={`${preview.amountBLabel} ${SYMBOLS.tokenB}`}
        />
      </div>

      <div className="mt-4 rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-cyan-300">
          Pool logic
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Removing liquidity burns your {SYMBOLS.lpToken} and returns{" "}
          {SYMBOLS.tokenA}/{SYMBOLS.tokenB} based on your current pool share.
        </p>
      </div>

      <div className="mt-4 rounded-[18px] border border-red-400/20 bg-red-400/10 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-red-300">
          Burn preview
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          This action burns {lpAmount || "0"} {SYMBOLS.lpToken}. Your remaining LP
          balance is estimated after confirmation.
        </p>
      </div>

      <button
        onClick={handleRemoveLiquidity}
        disabled={liquidity.pending}
        className="mt-auto w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!connected ? "Connect Wallet" : liquidity.pending ? "Processing..." : "Remove Liquidity"}
      </button>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const color = tone === "success" ? "text-emerald-400" : "text-[var(--text)]";

  return (
    <div className="mt-2 flex items-center justify-between gap-4 text-sm first:mt-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`max-w-[190px] truncate text-right font-bold ${color}`}>
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