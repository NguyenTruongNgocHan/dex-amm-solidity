import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function TradePanelCard({
  ammData,
  connected,
  onConnect,
  trade,
}) {
  const [amount, setAmount] = useState("100");

  const estimatedOut = useMemo(() => {
    const input = Number(amount || "0");
    const price = Number(ammData.priceAinB || "0");

    if (!input || !price) return "0";

    return (input * 0.997 * price).toFixed(4);
  }, [amount, ammData.priceAinB]);

  async function handleSwap() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    await trade.swapTokenAForTokenB(amount, "0");
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

      <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">Estimated output</div>
        <div className="mt-2 text-[32px] font-bold leading-none text-teal-600 dark:text-teal-300">
          {estimatedOut} TKB
        </div>

        <InfoRow label="Pool price" value={`${ammData.priceAinB} TKB`} />
        <InfoRow label="Fee" value="0.3%" />
        <InfoRow
          label="Pool status"
          value={ammData.hasLiquidity ? "Active" : "Empty"}
          tone="success"
        />
      </div>

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

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
  }[tone];

  return (
    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}