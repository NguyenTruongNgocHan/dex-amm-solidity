import { Activity } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function ActivityAnalyticsCard({ events = [] }) {
  const swaps = events.filter((e) => e.type === "SWAP").length;
  const adds = events.filter((e) => e.type === "ADD").length;
  const removes = events.filter((e) => e.type === "REMOVE").length;

  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-3">
        <IconBadge tone="primary" className="h-10 w-10">
          <Activity size={18} />
        </IconBadge>

        <div>
          <h3 className="text-[17px] font-bold text-[var(--text)]">
            Activity Analytics
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Based on recent contract event logs
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Stat label="Total Events" value={events.length} />
        <Stat label="Swaps" value={swaps} tone="blue" />
        <Stat label="Adds" value={adds} tone="success" />
        <Stat label="Removes" value={removes} tone="danger" />
      </div>
    </SurfaceCard>
  );
}

function Stat({ label, value, tone = "neutral" }) {
  const color = {
    neutral: "text-[var(--text)]",
    blue: "text-blue-500",
    success: "text-emerald-500",
    danger: "text-red-500",
  }[tone];

  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`mt-2 text-[26px] font-bold ${color}`}>{value}</div>
    </div>
  );
}