import { Info, Route } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";
import { SYMBOLS } from "../../config/contracts";

export default function MarketOverviewCard({ ammData, loading, activity }) {
  const latestEvent = activity?.events?.[0];

  return (
    <SurfaceCard className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <IconBadge tone="primary" className="h-12 w-12 text-xl font-bold">
            {SYMBOLS.tokenA[0]}
          </IconBadge>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[22px] font-bold text-[var(--text)]">
                {SYMBOLS.tokenA} / {SYMBOLS.tokenB}
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-dark)]">
                <Route size={12} />
                AMM Pair
              </div>
            </div>

            <div className="mt-1 text-sm text-[var(--muted)]">
              Constant product pool · x * y = k
            </div>
          </div>
        </div>

        <div className="lg:text-right">
          <div className="text-[30px] font-bold leading-none text-[var(--text)]">
            {loading ? "Loading..." : `${ammData.priceAinB} ${SYMBOLS.tokenB}`}
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            pool price
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`Reserve ${SYMBOLS.tokenA}`} value={ammData.reserveA} />
        <Stat
          label={`Reserve ${SYMBOLS.tokenB}`}
          value={ammData.reserveB}
          tone="success"
        />
        <Stat
          label={`Your ${SYMBOLS.lpToken}`}
          value={ammData.lpBalance}
          tone="primary"
        />
        <Stat
          label="Latest"
          value={latestEvent ? latestEvent.type : "—"}
          tone="primary"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Info size={15} />
          Route
        </div>

        <div className="text-sm font-bold text-[var(--text)]">
          {SYMBOLS.tokenA} → AMM Pool → {SYMBOLS.tokenB}
        </div>
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