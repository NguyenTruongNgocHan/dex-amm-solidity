import {
  ArrowDownUp,
  Flame,
  Gift,
  Layers,
  Plus,
  TrendingUp,
  Upload,
} from "lucide-react";

import SurfaceCard from "../../components/common/SurfaceCard";

function countByType(
  events = [],
  type
) {
  return events.filter(
    (event) => event.type === type
  ).length;
}

export default function ActivityAnalyticsCard({
  events = [],
}) {
  const stats = [
    {
      label: "Total",
      value: events.length,
      icon: <TrendingUp size={16} />,
      tone: "blue",
    },
    {
      label: "Swaps",
      value: countByType(
        events,
        "SWAP"
      ),
      icon: (
        <ArrowDownUp size={16} />
      ),
      tone: "blue",
    },
    {
      label: "Adds",
      value: countByType(
        events,
        "ADD_LIQUIDITY"
      ),
      icon: <Plus size={16} />,
      tone: "success",
    },
    {
      label: "Removes",
      value: countByType(
        events,
        "REMOVE_LIQUIDITY"
      ),
      icon: <Flame size={16} />,
      tone: "danger",
    },
    {
      label: "Stakes",
      value: countByType(
        events,
        "STAKE"
      ),
      icon: <Layers size={16} />,
      tone: "purple",
    },
    {
      label: "Unstakes",
      value: countByType(
        events,
        "UNSTAKE"
      ),
      icon: <Upload size={16} />,
      tone: "warning",
    },
    {
      label: "Claims",
      value: countByType(
        events,
        "CLAIM_REWARD"
      ),
      icon: <Gift size={16} />,
      tone: "pink",
    },
  ];

  return (
    <SurfaceCard className="flex min-h-[330px] flex-col p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--purple-soft)] text-[var(--purple)]">
          <TrendingUp size={22} />
        </div>

        <div>
          <div className="dex-chip">
            Activity
          </div>

          <h3 className="mt-3 text-2xl font-black text-[var(--text)]">
            Activity Analytics
          </h3>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Unified contract event logs across AMM and Farm.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {stats.map((stat) => (
          <StatBox
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      {/* NEW SECTION */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MiniInsight
          title="Most Active"
          value="Liquidity"
          description="Most recent actions came from LP operations."
          tone="success"
        />

        <MiniInsight
          title="Risk Level"
          value="Low"
          description="No suspicious slippage or abnormal reserve activity detected."
          tone="blue"
        />

        <MiniInsight
          title="Audit State"
          value="Tracked"
          description="All critical protocol actions are indexed in the activity timeline."
          tone="purple"
        />
      </div>
    </SurfaceCard>
  );
}

function StatBox({
  label,
  value,
  icon,
  tone,
}) {
  const toneMap = {
    success:
      "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
    danger:
      "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
    warning:
      "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
    blue:
      "border-[var(--blue-border)] bg-[var(--blue-soft)] text-[var(--blue)]",
    purple:
      "border-[var(--purple-border)] bg-[var(--purple-soft)] text-[var(--purple)]",
    pink:
      "border-[var(--pink-soft)] bg-[var(--pink-soft)] text-[var(--pink)]",
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl border ${
          toneMap[tone]
        }`}
      >
        {icon}
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black leading-none text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}

function MiniInsight({
  title,
  value,
  description,
  tone,
}) {
  const toneClass = {
    success:
      "border-[rgba(34,197,94,.18)] bg-[rgba(34,197,94,.05)]",
    blue:
      "border-[rgba(59,130,246,.18)] bg-[rgba(59,130,246,.05)]",
    purple:
      "border-[rgba(168,85,247,.18)] bg-[rgba(168,85,247,.05)]",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${
        toneClass[tone]
      }`}
    >
      <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-[var(--text)]">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}