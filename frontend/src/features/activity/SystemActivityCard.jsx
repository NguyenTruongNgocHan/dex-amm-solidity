import { useState } from "react";
import {
  ArrowDownUp,
  Copy,
  Droplets,
  ExternalLink,
  Gift,
  History,
  Layers,
  LogOut,
  RefreshCcw,
  X,
} from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import Button from "../../components/common/Button";

const meta = {
  SWAP: {
    icon: <ArrowDownUp size={16} />,
    label: "Swap",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    iconBox: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  ADD: {
    icon: <Droplets size={16} />,
    label: "Liquidity",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    iconBox: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  REMOVE: {
    icon: <LogOut size={16} />,
    label: "Remove",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    iconBox: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  STAKE: {
    icon: <Layers size={16} />,
    label: "Stake",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    iconBox: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  UNSTAKE: {
    icon: <LogOut size={16} />,
    label: "Withdraw",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    iconBox: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
  CLAIM: {
    icon: <Gift size={16} />,
    label: "Reward",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
    iconBox: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  },
};

function getMeta(type) {
  return meta[type] || {
    icon: <History size={16} />,
    label: "Activity",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    iconBox: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  };
}

function ActivityRow({ item, expanded = false }) {
  const itemMeta = getMeta(item.type);

  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 transition hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${itemMeta.iconBox}`}>
            {itemMeta.icon}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[var(--text)]">
              {item.title}
            </div>
            <div className="mt-1 truncate text-xs font-medium text-[var(--muted)]">
              {item.user} · Block #{item.blockNumber}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm font-black text-[var(--text)]">{item.primary}</div>
          <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${itemMeta.badge}`}>
            {item.secondary || itemMeta.label}
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
          <div>{item.description}</div>
          <div className="flex items-start gap-2 break-all">
            <Copy size={13} className="mt-0.5 shrink-0" />
            {item.txHash}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActivityModal({ open, events, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="max-h-[84vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-[var(--text)]">All System Activity</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Swap, liquidity, staking, and reward events from the local chain.
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[64vh] overflow-y-auto p-6">
          {events.length === 0 ? (
            <EmptyState text="No system activity yet." />
          ) : (
            <div className="space-y-3">
              {events.map((item) => (
                <ActivityRow key={item.id} item={item} expanded />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-8 text-center text-sm font-medium text-[var(--muted)]">
      {text}
    </div>
  );
}

export default function SystemActivityCard({
  events = [],
  allEvents = [],
  loading,
  onRefresh,
  title = "Recent System Activity",
  compact = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SurfaceCard className="p-5" hover>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
                <History size={17} />
              </div>
              <h2 className="text-lg font-black text-[var(--text)]">{title}</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Unified history across swap, liquidity, farming, and reward actions.
            </p>
          </div>

          <div className="flex gap-2">
            {onRefresh ? (
              <button
                onClick={onRefresh}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] transition hover:text-[var(--primary-dark)]"
              >
                <RefreshCcw size={15} />
              </button>
            ) : null}

            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              View all
              <ExternalLink size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <EmptyState text="Loading activity..." />
          ) : events.length === 0 ? (
            <EmptyState text="No on-chain activity yet." />
          ) : (
            events.slice(0, compact ? 5 : 8).map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))
          )}
        </div>
      </SurfaceCard>

      <ActivityModal open={open} events={allEvents} onClose={() => setOpen(false)} />
    </>
  );
}
