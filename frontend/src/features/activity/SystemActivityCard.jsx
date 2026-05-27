import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Copy,
  Droplets,
  ExternalLink,
  Eye,
  EyeOff,
  Gift,
  History,
  Layers,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import useAccessProfile from "../../hooks/useAccessProfile";

function sameAddress(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function canViewSystemWide(profile) {
  return Boolean(profile?.isAdmin || profile?.isOperator || profile?.isAuditor);
}

function filterEventsByVisibility(events, walletAddress, profile) {
  if (canViewSystemWide(profile)) return events;
  if (!walletAddress) return [];

  return events.filter((event) => sameAddress(event.actorAddress, walletAddress));
}

function getVisibilityMeta(profile, walletAddress) {
  if (!walletAddress) {
    return {
      label: "Connect wallet",
      description: "Connect wallet to view your own activity history.",
      icon: <EyeOff size={14} />,
      className:
        "border-amber-300 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    };
  }

  if (canViewSystemWide(profile)) {
    return {
      label: "System-wide Activity",
      description:
        "Admin, Operator, and Auditor can inspect all protocol activities.",
      icon: <ShieldCheck size={14} />,
      className:
        "border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)]",
    };
  }

  return {
    label: "My Activity Only",
    description:
      "Public users only see activities emitted by their connected wallet.",
    icon: <UserRound size={14} />,
    className:
      "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]",
  };
}

function getActivityMeta(type) {
  const map = {
    SWAP: {
      icon: <ArrowDownUp size={16} />,
      label: "Swap",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    ADD: {
      icon: <Droplets size={16} />,
      label: "Add LP",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    REMOVE: {
      icon: <LogOut size={16} />,
      label: "Remove LP",
      color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
    STAKE: {
      icon: <Layers size={16} />,
      label: "Stake",
      color:
        "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    },
    UNSTAKE: {
      icon: <LogOut size={16} />,
      label: "Unstake",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    },
    CLAIM: {
      icon: <Gift size={16} />,
      label: "Claim",
      color:
        "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    },
    EVIDENCE: {
      icon: <ShieldCheck size={16} />,
      label: "Evidence",
      color:
        "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
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

function shortTx(txHash) {
  if (!txHash) return "N/A";
  return `${txHash.slice(0, 10)}...${txHash.slice(-6)}`;
}

function ActivityRow({ item }) {
  const meta = getActivityMeta(item.type);

  return (
    <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:border-[var(--primary)]/30 hover:bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${meta.color}`}
            >
              {meta.icon}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-black text-[var(--text)]">
                  {item.title}
                </h3>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${meta.color}`}
                >
                  {meta.label}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                {item.description}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[var(--muted)]">
                <span>{item.user}</span>
                <span>•</span>
                <span>Block #{item.blockNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-black text-[var(--text)]">
              {item.primary}
            </div>

            <div className="mt-1 text-xs font-bold text-[var(--primary)]">
              {item.secondary}
            </div>
          </div>

          <button
            onClick={() => copyTx(item.txHash)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] opacity-0 transition hover:bg-[var(--surface)] group-hover:opacity-100"
            title={shortTx(item.txHash)}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ActivityModal({ open, events, visibilityMeta, onClose }) {
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

        return [
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
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        const orderA = Number(a.order || a.blockNumber || 0);
        const orderB = Number(b.order || b.blockNumber || 0);
        return sort === "desc" ? orderB - orderA : orderA - orderB;
      });
  }, [events, query, sort, type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <header className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${visibilityMeta.className}`}
              >
                {visibilityMeta.icon}
                {visibilityMeta.label}
              </div>

              <h2 className="text-2xl font-black text-[var(--text)]">
                System Activity
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {visibilityMeta.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)]"
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
                placeholder="Search action, wallet, tx, block..."
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
            Showing {filteredEvents.length} / {events.length} visible
            activities
          </div>
        </header>

        <main className="custom-scrollbar flex-1 overflow-auto p-5">
          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center text-sm text-[var(--muted)]">
              No activity matched your visibility scope or search.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SystemActivityCard({
  events = [],
  allEvents = [],
  loading,
  onRefresh,
  wallet,
  title = "Recent System Activity",
  description = "On-chain history across swap, liquidity, farming, and reward actions.",
  compact = false,
  scroll = false,
  maxHeight = "360px",
}) {
  const [open, setOpen] = useState(false);
  const { profile } = useAccessProfile(wallet);

  const visibilityMeta = getVisibilityMeta(profile, wallet?.address);

  const visibleEvents = useMemo(() => {
    const sourceEvents = compact ? events.slice(0, 3) : events;
    return filterEventsByVisibility(sourceEvents, wallet?.address, profile);
  }, [compact, events, profile, wallet?.address]);

  const visibleAllEvents = useMemo(() => {
    return filterEventsByVisibility(allEvents, wallet?.address, profile);
  }, [allEvents, profile, wallet?.address]);

  return (
    <>
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <History size={18} />
              </div>

              <h2 className="text-lg font-black leading-tight text-[var(--text)]">
                {title}
              </h2>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${visibilityMeta.className}`}
              >
                {visibilityMeta.icon}
                {visibilityMeta.label}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              {visibilityMeta.description}
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
              View visible
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
            No visible activity under current role scope.
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
        events={visibleAllEvents}
        visibilityMeta={visibilityMeta}
        onClose={() => setOpen(false)}
      />
    </>
  );
}