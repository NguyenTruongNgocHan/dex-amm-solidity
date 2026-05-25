import { LayoutDashboard } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import StatusBanner from "../../components/common/StatusBanner";
import PageContainer from "../../components/layout/PageContainer";
import PoolAnalyticsCard from "./PoolAnalyticsCard";
import WalletOverviewCard from "./WalletOverviewCard";
import LPPositionCard from "./LPPositionCard";
import ActivityAnalyticsCard from "./ActivityAnalyticsCard";
import PriceOverviewCard from "./PriceOverviewCard";
import SystemActivityCard from "../activity/SystemActivityCard";

export default function DashboardLayout({ wallet, amm, activity }) {
  const showStatus = wallet.status || amm.error;
  const connected = Boolean(wallet.address);

  return (
    <PageContainer>
      <PageHero
        badge="AMM Command Center"
        icon={<LayoutDashboard size={14} />}
        title="Monitor the"
        highlight="DEX market"
        description="Track pool reserves, wallet balances, LP ownership, and system activity from one clean production dashboard."
        stats={[
          { label: "TVL Snapshot", value: amm.data.tvlLabel },
          { label: "Total LP Supply", value: amm.data.totalLiquidity },
          {
            label: "On-chain Events",
            value: activity.allEvents?.length || activity.events?.length || 0,
          },
        ]}
      />

      <div className="mt-4">
        <StatusBanner message={showStatus} />
      </div>

      <section className="mt-6 grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <PoolAnalyticsCard ammData={amm.data} loading={amm.loading} />
        </div>

        <div className="xl:col-span-4">
          <PriceOverviewCard ammData={amm.data} />
        </div>

        <div className="xl:col-span-4">
          <WalletOverviewCard
            ammData={amm.data}
            connected={connected}
            address={wallet.address}
          />
        </div>

        <div className="flex xl:col-span-8">
          <ActivityAnalyticsCard
            events={activity.allEvents || activity.events}
          />
        </div>

        <div className="flex xl:col-span-4">
          <LPPositionCard ammData={amm.data} connected={connected} />
        </div>

        <div className="xl:col-span-12">
          <SystemActivityCard
            events={activity.events}
            allEvents={activity.allEvents}
            loading={activity.loading}
            onRefresh={activity.reloadEvents}
            title="Recent System Activity"
            description="On-chain timeline for swaps, liquidity operations, staking, and rewards."
            scroll
            maxHeight="360px"
          />
        </div>
      </section>
    </PageContainer>
  );
}