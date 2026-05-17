import {
  Activity,
  ArrowDownUp,
  ArrowUpFromLine,
  Droplets,
  Gift,
  Layers,
  LogOut,
} from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function ActivityAnalyticsCard({ events = [] }) {
  const swaps = events.filter((e) => e.type === "SWAP").length;
  const adds = events.filter((e) => e.type === "ADD").length;
  const removes = events.filter((e) => e.type === "REMOVE").length;
  const stakes = events.filter((e) => e.type === "STAKE").length;
  const unstakes = events.filter((e) => e.type === "UNSTAKE").length;
  const claims = events.filter((e) => e.type === "CLAIM").length;

  return (
    <SurfaceCard className="p-5" hover>
      <div className="flex items-center gap-3">
        <IconBadge tone="violet" className="h-11 w-11">
          <Activity size={19} />
        </IconBadge>

        <div>
          <h3 className="text-lg font-black text-[var(--text)]">
            Activity Analytics
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Unified contract event logs across AMM and Farm
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <Stat
          label="Total"
          value={events.length}
          icon={<Activity size={15} />}
          tone="neutral"
        />
        <Stat
          label="Swaps"
          value={swaps}
          icon={<ArrowDownUp size={15} />}
          tone="blue"
        />
        <Stat
          label="Adds"
          value={adds}
          icon={<Droplets size={15} />}
          tone="success"
        />
        <Stat
          label="Removes"
          value={removes}
          icon={<LogOut size={15} />}
          tone="danger"
        />
        <Stat
          label="Stakes"
          value={stakes}
          icon={<Layers size={15} />}
          tone="violet"
        />
        <Stat
          label="Unstakes"
          value={unstakes}
          icon={<ArrowUpFromLine size={15} />}
          tone="orange"
        />
        <Stat
          label="Claims"
          value={claims}
          icon={<Gift size={15} />}
          tone="pink"
        />
      </div>
    </SurfaceCard>
  );
}

function Stat({ label, value, icon, tone = "neutral" }) {
  const styles = {
    neutral:
      "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary-border)]">
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${styles}`}>
        {icon}
      </div>

      <div className="text-xs font-bold text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-black text-[var(--text)]">{value}</div>
    </div>
  );
}