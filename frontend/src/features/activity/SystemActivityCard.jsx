import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Copy,
  Database,
  Droplets,
  ExternalLink,
  Gift,
  History,
  Layers,
  LogOut,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";

function getActivityMeta(type) {
  const map = {
    SWAP: {
      icon: <ArrowDownUp size={16} />,
      label: "Swap",
      color:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    ADD: {
      icon: <Droplets size={16} />,
      label: "Added",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    REMOVE: {
      icon: <LogOut size={16} />,
      label: "Removed",
      color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
    STAKE: {
      icon: <Layers size={16} />,
      label: "Staked",
      color:
        "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    },
    UNSTAKE: {
      icon: <LogOut size={16} />,
      label: "Unstaked",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    },
    CLAIM: {
      icon: <Gift size={16} />,
      label: "Claimed",
      color:
        "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    },
  };

  return (
    map[type] || {
      icon: <History size={16} />,
      label: "Action",
      color:
        "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    }
  );
}

function copyTx(txHash) {
  navigator.clipboard?.writeText(txHash);
}

function ActivityRow({ item, detailed = false }) {
  const meta = getActivityMeta(item.type);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${meta.color}`}
          >
            {meta.icon}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[var(--text)]">
              {item.title}
            </div>

            <div className="mt-1 truncate text-xs text-[var(--muted)]">
              {item.user} · Block #{item.blockNumber}
            </div>

            {item.source ? (
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                <Database size={11} />
                {item.source}
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm font-black text-[var(--text)]">
            {item.primary}
          </div>

          <div
            className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${meta.color}`}
          >
            {item.secondary || meta.label}
          </div>
        </div>
      </div>

      {detailed ? (
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
            {item.description}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
            <span className="min-w-0 flex-1 break-all">
              Tx: {item.txHash || "N/A"}
            </span>

            {item.txHash ? (
              <button
                onClick={() => copyTx(item.txHash)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
                title="Copy transaction hash"
              >
                <Copy size={14} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActivityTableRow({ item }) {
  const meta = getActivityMeta(item.type);

  return (
    <div className="grid min-w-[900px] grid-cols-[1.2fr_1fr_0.9fr_0.8fr_1.6fr_44px] items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${meta.color}`}
        >
          {meta.icon}
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-black text-[var(--text)]">
            {item.title}
          </div>
          <div
            className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${meta.color}`}
          >
            {item.secondary || meta.label}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-xs font-bold text-[var(--muted)]">User</div>
        <div className="mt-1 truncate text-sm font-bold text-[var(--text)]">
          {item.user || "-"}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-[var(--muted)]">Amount</div>
        <div className="mt-1 text-sm font-black text-[var(--text)]">
          {item.primary}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-[var(--muted)]">Block</div>
        <div className="mt-1 text-sm font-bold text-[var(--text)]">
          #{item.blockNumber}
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-xs font-bold text-[var(--muted)]">Transaction</div>
        <div className="mt-1 truncate text-sm font-bold text-[var(--text)]">
          {item.txHash || "N/A"}
        </div>
        {item.source ? (
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
            <Database size={11} />
            {item.source}
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        {item.txHash ? (
          <button
            onClick={() => copyTx(item.txHash)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)]"
            title="Copy transaction hash"
          >
            <Copy size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ActivityModal({ open, events, onClose }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("desc");
  const [type, setType] = useState("ALL");

  const eventTypes = useMemo(() => {
    const types = Array.from(new Set(events.map((event) => event.type)));
    return ["ALL", ...types];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events
      .filter((item) => {
        if (type !== "ALL" && item.type !== type) return false;

        if (!normalizedQuery) return true;

        const haystack = [
          item.type,
          item.title,
          item.user,
          item.primary,
          item.secondary,
          item.description,
          item.txHash,
          item.blockNumber,
          item.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const orderA = Number(a.order || a.blockNumber || 0);
        const orderB = Number(b.order || b.blockNumber || 0);

        return sort === "desc" ? orderB - orderA : orderA - orderB;
      });
  }, [events, query, sort, type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm dark:bg-black/70">
      <div className="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--text)]">
                All System Activity
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Search, sort, and review swap, liquidity, staking, and reward
                events.
              </p>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <Search size={16} className="text-[var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by action, wallet, tx hash, block..."
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </label>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
            >
              {eventTypes.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All actions" : item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>

          <div className="mt-3 text-xs font-bold text-[var(--muted)]">
            Showing {filteredEvents.length} / {events.length} activities
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-auto p-6">
          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center text-sm text-[var(--muted)]">
              No activity matched your search.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((item) => (
                <ActivityTableRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SystemActivityCard({
  events = [],
  allEvents = [],
  loading,
  onRefresh,
  title = "Recent System Activity",
  description = "Unified history across swap, liquidity, farming, and reward actions.",
  compact = false,
  scroll = false,
  maxHeight = "360px",
}) {
  const [open, setOpen] = useState(false);

  const visibleEvents = compact ? events.slice(0, 3) : events;

  return (
    <>
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <History size={18} />
              </div>

              <h2 className="text-lg font-black leading-tight text-[var(--text)]">
                {title}
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onRefresh ? (
              <button
                onClick={onRefresh}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
                title="Refresh activity"
              >
                <RefreshCcw size={15} />
              </button>
            ) : null}

            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-bold text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              View all
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center text-sm text-[var(--muted)]">
            Loading activity...
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center text-sm text-[var(--muted)]">
            No on-chain activity yet.
          </div>
        ) : (
          <div
            className={`space-y-3 ${
              scroll ? "custom-scrollbar overflow-y-auto pr-2" : ""
            }`}
            style={scroll ? { maxHeight } : undefined}
          >
            {visibleEvents.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <ActivityModal
        open={open}
        events={allEvents}
        onClose={() => setOpen(false)}
      />
    </>
  );
}