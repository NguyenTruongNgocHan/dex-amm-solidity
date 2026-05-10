import { useState } from "react";

import AppShell from "../components/layout/AppShell";

import useStakingData from "../hooks/useStakingData";
import useStakingActions from "../hooks/useStakingActions";
import useSystemEvents from "../hooks/useSystemEvents";

import FarmHeader from "../features/farm/FarmHeader";
import FarmStatsGrid from "../features/farm/FarmStatsGrid";
import FarmPositionCard from "../features/farm/FarmPositionCard";
import FarmStakeCard from "../features/farm/FarmStakeCard";
import FarmRewardCard from "../features/farm/FarmRewardCard";
import FarmExplainCard from "../features/farm/FarmExplainCard";
import SystemActivityCard from "../features/activity/SystemActivityCard";
import StatusBanner from "../components/common/StatusBanner";

export default function FarmPage({
  onNavigate,
  wallet,
  activityRefreshKey,
  refreshActivity,
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const stakingData = useStakingData(
    wallet.address,
    wallet.provider,
    refreshKey
  );

  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 8);

  async function reloadFarm() {
    setRefreshKey((prev) => prev + 1);
    await activity.reloadEvents();
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
          stakingData={stakingData}
        />

        <StatusBanner message={wallet.status} className="mt-5" />

        <FarmStatsGrid stakingData={stakingData} />

        <div className="mt-6 grid gap-5 xl:grid-cols-12">
          <section className="space-y-5 xl:col-span-4">
            <FarmPositionCard stakingData={stakingData} />
            <FarmExplainCard />
          </section>

          <section className="space-y-5 xl:col-span-4">
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

          <aside className="xl:col-span-4">
            <div className="xl:sticky xl:top-28">
              <SystemActivityCard
                events={activity.events}
                allEvents={activity.allEvents}
                loading={activity.loading}
                onRefresh={activity.reloadEvents}
                title="Recent System Activity"
                description="Unified history across swap, liquidity, farming, and reward actions."
                scroll
              />
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}