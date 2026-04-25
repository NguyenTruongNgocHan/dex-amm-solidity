import { Droplets } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function PoolSummaryCard({ ammData, loading }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-3">
        <IconBadge tone="primary" className="h-11 w-11">
          <Droplets size={20} />
        </IconBadge>

        <div>
          <h3 className="text-[18px] font-bold text-[var(--text)]">
            Pool Summary
          </h3>
          <p className="text-sm text-[var(--muted)]">TokenA / TokenB pool</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <InfoRow label="Reserve TokenA" value={loading ? "..." : ammData.reserveA} />
        <InfoRow label="Reserve TokenB" value={loading ? "..." : ammData.reserveB} />
        <InfoRow label="Price A → B" value={`${ammData.priceAinB} TKB`} />
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
  const color = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
    warning: "text-amber-500",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}