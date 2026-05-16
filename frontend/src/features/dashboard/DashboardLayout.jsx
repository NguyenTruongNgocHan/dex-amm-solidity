import { LayoutDashboard } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import StatusBanner from "../../components/common/StatusBanner";
import PoolAnalyticsCard from "./PoolAnalyticsCard";
import WalletOverviewCard from "./WalletOverviewCard";
import LPPositionCard from "./LPPositionCard";
import ActivityAnalyticsCard from "./ActivityAnalyticsCard";
import PriceOverviewCard from "./PriceOverviewCard";
import IPFSPanelCard from "../ipfs/IPFSPanelCard";
import SystemActivityCard from "../activity/SystemActivityCard";
import Button from "../../components/common/Button";

export default function DashboardLayout({ wallet, amm, activity }) {
  const showStatus = wallet.status || amm.error;
  const connected = Boolean(wallet.address);

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <PageHero
        badge="AMM Command Center"
        icon={<LayoutDashboard size={14} />}
        title="Monitor the full"
        highlight="DEX system"
        description="A unified dashboard for pool reserves, wallet balances, LP ownership, system-wide activity, and off-chain IPFS documents."
        action={
          <Button
            variant={connected ? "secondary" : "primary"}
            onClick={wallet.connect}
          >
            {connected ? "Wallet Connected" : "Connect Wallet"}
          </Button>
        }
        stats={[
          { label: "TVL Snapshot", value: amm.data.tvlLabel },
          { label: "Total LP Supply", value: amm.data.totalLiquidity },
          {
            label: "Recent Events",
            value: activity.allEvents?.length || activity.events?.length || 0,
          },
        ]}
      />

      <StatusBanner message={showStatus} className="mt-5" />

      <section className="mt-6 grid gap-5 xl:grid-cols-12 xl:items-stretch">
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

        <div className="xl:col-span-8">
          <ActivityAnalyticsCard events={activity.allEvents || activity.events} />
        </div>

        <div className="xl:col-span-4 xl:row-span-2">
          <LPPositionCard ammData={amm.data} connected={connected} />
        </div>

        <div className="xl:col-span-8">
          <SystemActivityCard
            events={activity.events}
            allEvents={activity.allEvents}
            loading={activity.loading}
            onRefresh={activity.reloadEvents}
            title="Recent System Activity"
            description="A unified timeline for swaps, liquidity operations, LP staking, and rewards."
            scroll
            maxHeight="360px"
          />
        </div>
      </section>

      <section className="mt-6">
        <IPFSPanelCard walletAddress={wallet.address} />
      </section>
    </main>
  );
}