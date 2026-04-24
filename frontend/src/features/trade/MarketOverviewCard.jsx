import { Info } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function MarketOverviewCard({ ammData, loading }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <IconBadge tone="primary" className="h-14 w-14 text-[28px] font-bold">
            A
          </IconBadge>

          <div>
            <div className="text-[28px] font-extrabold tracking-tight text-[var(--text)]">
              TokenA / TokenB
            </div>
            <div className="mt-1 text-base text-[var(--muted)]">
              AMM liquidity pool
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[42px] font-extrabold leading-none tracking-tight text-[var(--text)]">
            {loading ? "..." : `${ammData?.priceAinB ?? "0"}`}
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            price
            <span>TKA → TKB</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5">
        <div className="grid flex-1 grid-cols-4 gap-4">
          <Stat label="Reserve A" value={ammData?.reserveA ?? "0"} tone="neutral" />
          <Stat label="Reserve B" value={ammData?.reserveB ?? "0"} tone="success" />
          <Stat label="Your LPT" value={ammData?.lpBalance ?? "0"} tone="primary" />
          <Stat label="Network" value="Hardhat" tone="primary" />
        </div>

        <button className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]">
          <Info size={16} />
        </button>
      </div>
    </SurfaceCard>
  );
}

function Stat({ label, value, tone }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
    danger: "text-red-500",
    primary: "text-teal-500",
  }[tone];

  return (
    <div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`mt-1 truncate text-[16px] font-bold ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}