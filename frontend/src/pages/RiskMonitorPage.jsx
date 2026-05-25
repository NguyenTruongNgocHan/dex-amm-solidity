import { ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import SurfaceCard from "../components/common/SurfaceCard";
import useSystemEvents from "../hooks/useSystemEvents";
import useAMMData from "../hooks/useAMMData";

import RiskFilterBar from "../features/risk/components/RiskFilterBar";
import RiskRuleExplainer from "../features/risk/components/RiskRuleExplainer";
import RiskSummaryStrip from "../features/risk/components/RiskSummaryStrip";
import RiskTransactionCard from "../features/risk/components/RiskTransactionCard";
import {
  clearFailedTransactions,
  getFailedTransactions,
} from "../features/risk/utils/failedTransactions";
import { classifyRisk } from "../features/risk/utils/riskRules";

export default function RiskMonitorPage({
  onNavigate,
  wallet,
  activityRefreshKey,
}) {
  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 120);
  const amm = useAMMData(wallet.provider, wallet.address);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [failedRefreshKey, setFailedRefreshKey] = useState(0);

  const failedTransactions = useMemo(() => {
    failedRefreshKey;
    return getFailedTransactions();
  }, [failedRefreshKey]);

  const riskRows = useMemo(() => {
    const onChainRows = activity.allEvents.map((event) => ({
      ...event,
      risk: classifyRisk(event, amm.data),
    }));

    const failedRows = failedTransactions.map((event) => ({
      ...event,
      title: event.title || "Failed Transaction Attempt",
      user: event.user || "Local wallet",
      primary: event.amountIn || "N/A",
      secondary: event.reason || "Failed",
      risk: classifyRisk(event, amm.data),
    }));

    return [...failedRows, ...onChainRows];
  }, [activity.allEvents, failedTransactions, amm.data]);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return riskRows.filter((row) => {
      const filterMatched = filter === "All" || row.risk.level === filter;

      const queryMatched =
        !keyword ||
        [
          row.type,
          row.title,
          row.txHash,
          row.user,
          row.primary,
          row.secondary,
          row.risk.level,
          ...(row.risk.reasons || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return filterMatched && queryMatched;
    });
  }, [riskRows, filter, query]);

  const summary = useMemo(() => {
    return riskRows.reduce(
      (acc, row) => {
        acc.total += 1;
        acc[row.risk.level] += 1;
        return acc;
      },
      { total: 0, Normal: 0, Warning: 0, Suspicious: 0 }
    );
  }, [riskRows]);

  function handleClearFailed() {
    clearFailedTransactions();
    setFailedRefreshKey((prev) => prev + 1);
  }

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
          description="Rule-based risk monitoring for abnormal swaps, large liquidity movements, failed attempts, and incomplete evidence."
          stats={[
            { label: "Normal", value: summary.Normal },
            { label: "Warning", value: summary.Warning },
            { label: "Suspicious", value: summary.Suspicious },
          ]}
        />

        <div className="mt-6">
          <RiskSummaryStrip summary={summary} />
        </div>

        <SurfaceCard className="mt-6 p-5">
          <RiskRuleExplainer />

          <div className="mt-5">
            <RiskFilterBar
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              onClearFailed={handleClearFailed}
            />
          </div>

          <div className="mt-5 grid gap-4">
            {activity.loading ? (
              <EmptyState text="Loading on-chain activity..." />
            ) : filteredRows.length === 0 ? (
              <EmptyState text="No matching risk event found." />
            ) : (
              filteredRows.map((row) => (
                <RiskTransactionCard key={row.id} row={row} />
              ))
            )}
          </div>
        </SurfaceCard>
      </PageContainer>
    </AppShell>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state min-h-[220px]">
      <div className="text-center text-sm font-bold text-[var(--muted)]">
        {text}
      </div>
    </div>
  );
}