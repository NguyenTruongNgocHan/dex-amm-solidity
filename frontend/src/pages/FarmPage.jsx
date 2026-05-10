import { useState } from "react";

import AppShell from "../components/layout/AppShell";

import useStakingData from "../hooks/useStakingData";
import useStakingActions from "../hooks/useStakingActions";

import FarmHeader from "../features/farm/FarmHeader";
import FarmStatsGrid from "../features/farm/FarmStatsGrid";
import FarmPositionCard from "../features/farm/FarmPositionCard";
import FarmStakeCard from "../features/farm/FarmStakeCard";
import FarmRewardCard from "../features/farm/FarmRewardCard";
import FarmExplainCard from "../features/farm/FarmExplainCard";

export default function FarmPage({
  onNavigate,
  wallet,
  refreshActivity,
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const stakingData = useStakingData(
    wallet.address,
    wallet.provider,
    refreshKey
  );

  function reloadFarm() {
    setRefreshKey((prev) => prev + 1);
    refreshActivity?.();
  }

  const actions = useStakingActions(
    wallet.signer,
    reloadFarm,
    wallet.setStatus
  );

  const connected = Boolean(wallet.address);

  return (
    <AppShell
      currentPage="farm"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <main className="mx-auto max-w-7xl px-6 py-6">
        <FarmHeader
          connected={connected}
          onConnect={wallet.connect}
        />

        {wallet.status ? (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            {wallet.status}
          </div>
        ) : null}

        <FarmStatsGrid stakingData={stakingData} />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-5">
            <FarmPositionCard stakingData={stakingData} />
            <FarmExplainCard />
          </section>

          <section className="space-y-5">
            <FarmStakeCard
              connected={connected}
              onConnect={wallet.connect}
              stakingData={stakingData}
              actions={actions}
            />

            <FarmRewardCard
              connected={connected}
              onConnect={wallet.connect}
              stakingData={stakingData}
              actions={actions}
            />
          </section>
        </div>
      </main>
    </AppShell>
  );
}