import SurfaceCard from "../../components/common/SurfaceCard";

export default function TradePanelCard() {
  return (
    <SurfaceCard className="p-5">
      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-xl bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white">
          Buy
        </button>
        <button className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-base font-semibold text-[var(--text)]">
          Sell
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-[16px] font-bold text-[var(--text)]">
          Trade TokenA → TokenB
        </h3>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          Amount to Spend
        </label>

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <input
              defaultValue="100"
              className="w-full bg-transparent text-[42px] font-extrabold leading-none text-[var(--text)] outline-none"
            />
            <div className="rounded-xl bg-[var(--surface-soft)] px-4 py-3 text-base font-bold text-[var(--text)]">
              TKA
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">You will receive</div>
        <div className="mt-2 text-[46px] font-extrabold leading-none text-teal-600 dark:text-teal-300">
          90.93
          <span className="block">TKB</span>
        </div>

        <InfoRow label="Price per token" value="1.1000 TKA" />
        <InfoRow label="Trading fee (0.3%)" value="0.300 TKA" />
        <InfoRow label="Price impact" value="9.07%" tone="warning" />
        <InfoRow label="Minimum received" value="90.02 TKB" tone="success" />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          Slippage Tolerance
        </label>

        <select className="w-full rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-base font-medium text-[var(--text)] outline-none">
          <option>1% - Recommended</option>
          <option>0.5%</option>
          <option>2%</option>
          <option>3%</option>
        </select>
      </div>

      <button className="mt-6 w-full rounded-[18px] bg-[var(--primary)] px-5 py-4 text-lg font-semibold text-white transition hover:opacity-90">
        Buy TokenB
      </button>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    warning: "text-amber-500",
    success: "text-emerald-500",
  }[tone];

  return (
    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}