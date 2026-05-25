import { Droplets } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

export default function PoolSummaryCard({ ammData }) {
  return (
    <SurfaceCard variant="panel" className="flex min-h-[300px] flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="dex-chip">Pool</div>
          <h3 className="mt-3 text-lg font-black text-[var(--text)]">
            {SYMBOLS.tokenA}/{SYMBOLS.tokenB}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            AMM reserve state
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          <Droplets size={20} />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <InfoRow
          label={`Reserve ${SYMBOLS.tokenA}`}
          value={`${ammData.reserveA} ${SYMBOLS.tokenA}`}
          tone="success"
        />
        <InfoRow
          label={`Reserve ${SYMBOLS.tokenB}`}
          value={`${ammData.reserveB} ${SYMBOLS.tokenB}`}
          tone="blue"
        />
        <InfoRow
          label="Status"
          value={ammData.hasLiquidity ? "Active" : "Empty"}
          tone={ammData.hasLiquidity ? "success" : "warning"}
        />
      </div>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const cls = {
    success: "market-up",
    blue: "text-[var(--blue)]",
    warning: "market-warning",
    neutral: "text-[var(--text)]",
  }[tone];

  return (
    <div className="dex-stat flex items-center justify-between gap-3">
      <span className="truncate text-sm font-bold text-[var(--muted)]">
        {label}
      </span>
      <span className={`max-w-[140px] truncate text-right text-sm font-black ${cls}`}>
        {value}
      </span>
    </div>
  );
}