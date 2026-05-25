import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import SurfaceCard from "../components/common/SurfaceCard";
import useSystemEvents from "../hooks/useSystemEvents";

function classifyRisk(event) {
  const primaryNumber = Number(
    String(event.primary || "0").replace(/,/g, "").split(" ")[0]
  );

  if (event.type === "SWAP" && primaryNumber >= 1000) {
    return {
      level: "Suspicious",
      reason: "Large swap size compared with demo pool scale.",
    };
  }

  if (event.type === "SWAP" && primaryNumber >= 300) {
    return {
      level: "Warning",
      reason: "Medium-to-large swap. Auditor should inspect price impact.",
    };
  }

  if (["ADD", "REMOVE"].includes(event.type) && primaryNumber >= 1000) {
    return {
      level: "Warning",
      reason: "Large liquidity movement can significantly change pool depth.",
    };
  }

  return {
    level: "Normal",
    reason: "No rule-based anomaly detected.",
  };
}

function levelClass(level) {
  if (level === "Suspicious") {
    return "border-red-300 bg-red-500/10 text-red-500";
  }

  if (level === "Warning") {
    return "border-amber-300 bg-amber-500/10 text-amber-500";
  }

  return "border-emerald-300 bg-emerald-500/10 text-emerald-500";
}

export default function RiskMonitorPage({
  onNavigate,
  wallet,
  activityRefreshKey,
}) {
  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 80);

  const riskRows = useMemo(() => {
    return activity.allEvents.map((event) => ({
      ...event,
      risk: classifyRisk(event),
    }));
  }, [activity.allEvents]);

  const summary = useMemo(() => {
    return riskRows.reduce(
      (acc, row) => {
        acc[row.risk.level] += 1;
        return acc;
      },
      { Normal: 0, Warning: 0, Suspicious: 0 }
    );
  }, [riskRows]);

  return (
    <AppShell
      currentPage="risk"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <PageHero
          badge="Risk Monitoring"
          icon={<ShieldAlert size={14} />}
          title="Detect suspicious"
          highlight="DEX activity"
          description="Rule-based monitoring for abnormal swaps, large liquidity movements, and transaction patterns that deserve auditor attention."
          stats={[
            { label: "Normal", value: summary.Normal },
            { label: "Warning", value: summary.Warning },
            { label: "Suspicious", value: summary.Suspicious },
          ]}
        />

        <SurfaceCard className="mt-6 p-5">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm text-amber-600">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-black">Rule-based detection only</div>
              <div className="mt-1 text-xs font-semibold">
                The monitor does not accuse users of fraud. It flags risky
                patterns for human auditor review.
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
            <div className="grid grid-cols-[120px_130px_1fr_1fr_1.5fr] border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-black uppercase tracking-wide text-[var(--muted)]">
              <div>Risk</div>
              <div>Type</div>
              <div>Tx Hash</div>
              <div>Actor</div>
              <div>Reason</div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              {activity.loading ? (
                <EmptyRow text="Loading risk monitor..." />
              ) : riskRows.length === 0 ? (
                <EmptyRow text="No on-chain activity available." />
              ) : (
                riskRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[120px_130px_1fr_1fr_1.5fr] items-center border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0"
                  >
                    <div>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-black ${levelClass(
                          row.risk.level
                        )}`}
                      >
                        {row.risk.level}
                      </span>
                    </div>

                    <div className="font-black text-[var(--text)]">
                      {row.type}
                    </div>

                    <div className="truncate font-mono text-xs font-bold text-[var(--text)]">
                      {row.txHash}
                    </div>

                    <div className="font-bold text-[var(--text)]">
                      {row.user || "Protocol"}
                    </div>

                    <div className="text-xs font-semibold text-[var(--muted)]">
                      {row.risk.reason}
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