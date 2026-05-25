import { Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import SurfaceCard from "../components/common/SurfaceCard";
import StatusBanner from "../components/common/StatusBanner";
import useSystemEvents from "../hooks/useSystemEvents";

export default function AuditPage({
  onNavigate,
  wallet,
  activityRefreshKey,
}) {
  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 80);
  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return activity.allEvents;

    return activity.allEvents.filter((event) => {
      return [
        event.type,
        event.title,
        event.txHash,
        event.user,
        event.primary,
        event.secondary,
        event.description,
        String(event.blockNumber || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [activity.allEvents, query]);

  return (
    <AppShell
      currentPage="audit"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <PageHero
          badge="Blockchain Trust Layer"
          icon={<ShieldCheck size={14} />}
          title="On-chain"
          highlight="audit trail"
          description="Search and inspect protocol events emitted by smart contracts. This page proves that successful swaps, liquidity updates, staking, and reward actions leave an immutable on-chain trace."
          stats={[
            { label: "Source", value: "Smart Contract Events" },
            { label: "Privacy", value: "Masked Wallets" },
            { label: "Purpose", value: "Trace / Verify / Investigate" },
          ]}
        />

        <div className="mt-4">
          <StatusBanner message={wallet.status} />
        </div>

        <SurfaceCard className="mt-6 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-black text-[var(--text)]">
                Transaction Evidence Search
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Search by tx hash, block number, event type, masked wallet, or
                token amount.
              </p>
            </div>

            <div className="flex h-11 min-w-[320px] items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3">
              <Search size={16} className="text-[var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search on-chain evidence..."
                className="w-full bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
            <div className="grid grid-cols-[110px_1.1fr_1fr_1fr_1.4fr] border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-black uppercase tracking-wide text-[var(--muted)]">
              <div>Type</div>
              <div>Tx Hash</div>
              <div>Block</div>
              <div>Actor</div>
              <div>Evidence Detail</div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              {activity.loading ? (
                <EmptyRow text="Loading on-chain events..." />
              ) : filteredEvents.length === 0 ? (
                <EmptyRow text="No matching on-chain evidence found." />
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-[110px_1.1fr_1fr_1fr_1.4fr] items-center border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0"
                  >
                    <div>
                      <span className="rounded-full border border-[var(--primary-border)] bg-[var(--primary-soft)] px-2 py-1 text-[11px] font-black text-[var(--primary-dark)]">
                        {event.type}
                      </span>
                    </div>

                    <div className="truncate font-mono text-xs font-bold text-[var(--text)]">
                      {event.txHash}
                    </div>

                    <div className="font-bold text-[var(--text)]">
                      #{event.blockNumber?.toString?.() || event.blockNumber}
                    </div>

                    <div className="font-bold text-[var(--text)]">
                      {event.user || "Protocol"}
                    </div>

                    <div>
                      <div className="font-bold text-[var(--text)]">
                        {event.primary}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                        {event.description || event.secondary}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </SurfaceCard>
      </PageContainer>
    </AppShell>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="px-4 py-10 text-center text-sm font-bold text-[var(--muted)]">
      {text}
    </div>
  );
}