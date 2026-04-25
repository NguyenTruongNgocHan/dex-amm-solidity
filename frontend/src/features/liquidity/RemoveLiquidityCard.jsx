import { useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function RemoveLiquidityCard({
  connected,
  onConnect,
  ammData,
  liquidity,
}) {
  const [lpAmount, setLpAmount] = useState("100");

  async function handleRemoveLiquidity() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    await liquidity.removeLiquidity(lpAmount);
  }

  function useMax() {
    setLpAmount(ammData.lpBalance || "0");
  }

  return (
    <SurfaceCard className="p-5">
      <div>
        <h3 className="text-[18px] font-bold text-[var(--text)]">
          Remove Liquidity
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Burn LP tokens to withdraw pool assets.
        </p>
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
              className="w-full bg-transparent text-[32px] font-bold leading-none text-[var(--text)] outline-none"
            />
            <div className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold text-[var(--text)]">
              LPT
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <InfoRow label="Your LP" value={`${connected ? ammData.lpBalance : "—"} LPT`} />
        <InfoRow label="Action" value="burn → withdraw" tone="success" />
      </div>

      <button
        onClick={handleRemoveLiquidity}
        disabled={liquidity.pending}
        className="mt-5 w-full rounded-[16px] bg-[var(--primary)] px-5 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!connected
          ? "Connect Wallet"
          : liquidity.pending
          ? "Processing..."
          : "Remove Liquidity"}
      </button>
    </SurfaceCard>
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
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}