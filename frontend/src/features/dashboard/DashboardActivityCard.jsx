import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCcw } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function DashboardActivityCard({ events = [], loading, onRefresh }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[17px] font-bold text-[var(--text)]">
            On-chain Activity
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Latest AMM contract events
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
        >
          <RefreshCcw size={15} />
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {loading ? (
          <EmptyState text="Loading events..." />
        ) : events.length === 0 ? (
          <EmptyState text="No on-chain activity yet." />
        ) : (
          events.map((event) => <ActivityRow key={event.id} event={event} />)
        )}
      </div>
    </SurfaceCard>
  );
}

function ActivityRow({ event }) {
  const meta = {
    SWAP: {
      icon: <ArrowUpRight size={15} />,
      label: "Swap",
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-500/15",
    },
    ADD: {
      icon: <Plus size={15} />,
      label: "Add Liquidity",
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-500/15",
    },
    REMOVE: {
      icon: <ArrowDownLeft size={15} />,
      label: "Remove Liquidity",
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-500/15",
    },
  }[event.type];

  return (
    <div className="grid gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 md:grid-cols-[1.5fr_1fr_1fr_0.7fr] md:items-center">
      <div className="flex items-center gap-3">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${meta.bg} ${meta.color}`}>
          {meta.icon}
        </div>

        <div>
          <div className="text-sm font-bold text-[var(--text)]">{meta.label}</div>
          <div className="text-xs text-[var(--muted)]">{event.user}</div>
        </div>
      </div>

      <div className="text-sm font-medium text-[var(--muted)]">{event.primary}</div>
      <div className="text-sm font-medium text-[var(--muted)]">{event.secondary}</div>
      <div className="text-right text-xs font-semibold text-[var(--muted)]">
        Block #{event.blockNumber}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-8 text-center text-sm text-[var(--muted)]">
      {text}
    </div>
  );
}