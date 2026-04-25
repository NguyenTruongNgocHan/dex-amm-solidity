import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCcw } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function RecentTradesCard({ events = [], loading, onRefresh }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[var(--text)]">
          Recent Activity
        </h3>

        <button
          onClick={onRefresh}
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
        >
          <RefreshCcw size={14} />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <EmptyState text="Loading events..." />
        ) : events.length === 0 ? (
          <EmptyState text="No on-chain activity yet." />
        ) : (
          events.map((event) => <ActivityItem key={event.id} event={event} />)
        )}
      </div>
    </SurfaceCard>
  );
}

function ActivityItem({ event }) {
  const meta = {
    SWAP: {
      icon: <ArrowUpRight size={16} />,
      label: "SWAP",
      badge:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      iconBox:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    ADD: {
      icon: <Plus size={16} />,
      label: "ADD",
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      iconBox:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    REMOVE: {
      icon: <ArrowDownLeft size={16} />,
      label: "REMOVE",
      badge:
        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
      iconBox:
        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
  }[event.type];

  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl ${meta.iconBox}`}
          >
            {meta.icon}
          </div>

          <div>
            <div className="text-sm font-bold text-[var(--text)]">
              {event.title}
            </div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              {event.user} · Block #{event.blockNumber}
            </div>
          </div>
        </div>

        <div className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badge}`}>
          {meta.label}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-[var(--surface)] px-2 py-2 text-[var(--muted)]">
          {event.primary}
        </div>
        <div className="rounded-lg bg-[var(--surface)] px-2 py-2 text-right text-[var(--muted)]">
          {event.secondary}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-6 text-center text-sm text-[var(--muted)]">
      {text}
    </div>
  );
}