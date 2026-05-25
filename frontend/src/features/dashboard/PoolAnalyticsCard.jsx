import { Activity, Droplets } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

export default function PoolAnalyticsCard({ ammData, loading }) {
  return (
    <SurfaceCard variant="panel" className="flex min-h-[330px] flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="dex-chip">Pool Depth</div>
          <h3 className="mt-3 text-xl font-black text-[var(--text)]">
            AMM Liquidity
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Reserve-backed market depth for the active pair.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          <Droplets size={22} />
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--primary-border)] bg-[var(--primary-soft)] p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
          TVL Snapshot
        </p>
        <p className="mt-2 text-3xl font-black text-[var(--primary-dark)]">
          {loading ? "Loading..." : ammData.tvlLabel}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <Metric
          label={`Reserve ${SYMBOLS.tokenA}`}
          value={`${ammData.reserveA} ${SYMBOLS.tokenA}`}
          tone="success"
        />
        <Metric
          label={`Reserve ${SYMBOLS.tokenB}`}
          value={`${ammData.reserveB} ${SYMBOLS.tokenB}`}
          tone="blue"
        />
        <Metric
          label="Pool Status"
          value={ammData.hasLiquidity ? "Active" : "Empty"}
          tone={ammData.hasLiquidity ? "success" : "warning"}
          icon={<Activity size={14} />}
        />
      </div>
    </SurfaceCard>
  );
}

function Metric({ label, value, tone = "neutral", icon }) {
  const color = {
    success: "market-up",
    danger: "market-down",
    warning: "market-warning",
    blue: "text-[var(--blue)]",
    neutral: "text-[var(--text)]",
  }[tone];

  return (
    <div className="dex-stat flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <span className="text-[var(--muted)]">{icon}</span> : null}
        <span className="truncate text-sm font-bold text-[var(--muted)]">
          {label}
        </span>
      </div>
      <span className={`max-w-[170px] truncate text-right text-sm font-black ${color}`}>
        {value}
      </span>
    </div>
  );
}