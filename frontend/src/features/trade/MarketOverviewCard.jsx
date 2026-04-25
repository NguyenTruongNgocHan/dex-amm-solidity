import { RefreshCcw } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function MarketOverviewCard({ ammData, loading }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <IconBadge tone="primary" className="h-12 w-12 text-xl font-bold">
            A
          </IconBadge>

          <div>
            <div className="text-[22px] font-bold text-[var(--text)]">
              TokenA / TokenB
            </div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              AMM liquidity pool
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[28px] font-bold leading-none text-[var(--text)]">
            {loading ? "Loading..." : `${ammData.priceAinB} TKB`}
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            pool price
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 border-t border-[var(--border)] pt-4">
        <Stat label="Reserve A" value={ammData.reserveA} />
        <Stat label="Reserve B" value={ammData.reserveB} tone="success" />
        <Stat label="Your LPT" value={ammData.lpBalance} tone="primary" />
        <Stat label="Status" value={ammData.hasLiquidity ? "Active" : "Empty"} tone="primary" />
      </div>
    </SurfaceCard>
  );
}

function Stat({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
    primary: "text-teal-500",
  }[tone];

  return (
    <div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`mt-1 truncate text-sm font-bold ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}