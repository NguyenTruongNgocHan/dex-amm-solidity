import { TrendingUp } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function PriceOverviewCard({ ammData }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-3">
        <IconBadge tone="soft" className="h-10 w-10">
          <TrendingUp size={18} />
        </IconBadge>

        <div>
          <h3 className="text-[17px] font-bold text-[var(--text)]">
            Price Overview
          </h3>
          <p className="text-sm text-[var(--muted)]">Spot price from reserves</p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">1 TokenA equals</div>
        <div className="mt-2 text-[34px] font-bold leading-none text-teal-600 dark:text-teal-300">
          {ammData.priceAinB} TKB
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <MetricRow label="1 TKB equals" value={`${ammData.priceBinA} TKA`} />
        <MetricRow label="Pricing model" value="x * y = k" />
      </div>
    </SurfaceCard>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-sm font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}