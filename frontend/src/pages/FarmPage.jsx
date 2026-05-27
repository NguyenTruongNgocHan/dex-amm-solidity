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
import FarmPageLayout from "../features/farm/FarmPageLayout";
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
      wallet={wallet}
    >
      <main className="mx-auto max-w-7xl px-6 py-6">
        <FarmHeader
          connected={connected}
          onConnect={wallet.connect}
          stakingData={stakingData}
        />

        <StatusBanner message={wallet.status} className="mt-5" />

        <FarmStatsGrid stakingData={stakingData} />

        <FarmPageLayout
          position={
            <FarmPositionCard
              stakingData={stakingData}
              connected={connected}
            />
          }
          stake={
            <FarmStakeCard
              connected={connected}
              onConnect={wallet.connect}
              stakingData={stakingData}
              actions={actions}
            />
          }
          reward={
            <FarmRewardCard
              connected={connected}
              onConnect={wallet.connect}
              stakingData={stakingData}
              actions={actions}
            />
          }
          explain={<FarmExplainCard />}
          activity={activity}
          wallet={wallet}
        />
      </main>
    </AppShell>
  );
}