import { Droplets } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import StatusBanner from "../../components/common/StatusBanner";
import PoolSummaryCard from "./PoolSummaryCard";
import AddLiquidityCard from "./AddLiquidityCard";
import RemoveLiquidityCard from "./RemoveLiquidityCard";
import PositionCard from "./PositionCard";
import SystemActivityCard from "../activity/SystemActivityCard";

export default function LiquidityPageLayout({
  wallet,
  amm,
  liquidity,
  activity,
}) {
  const showStatus = wallet.status || amm.error;

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <PageHero
        badge="Liquidity Provider Console"
        icon={<Droplets size={14} />}
        title="Provide liquidity and"
        highlight="earn pool fees"
        description="Add TKA and TKB into the pool, receive ALP liquidity provider tokens, and withdraw your proportional share whenever you want."
        stats={[
          {
            label: "Pool Status",
            value: amm.data.hasLiquidity ? "Active" : "Empty",
          },
          { label: "Your LP", value: `${amm.data.lpBalance} ALP` },
          { label: "Pool Share", value: `${amm.data.lpSharePercent}%` },
        ]}
      />

      <StatusBanner message={showStatus} className="mt-5" />

      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <section className="space-y-5 xl:col-span-4">
          <div className="xl:sticky xl:top-28 xl:space-y-5">
            <PoolSummaryCard ammData={amm.data} loading={amm.loading} />
            <PositionCard
              ammData={amm.data}
              connected={Boolean(wallet.address)}
            />
          </div>
        </section>

        <section className="space-y-5 xl:col-span-5">
          <AddLiquidityCard
            connected={Boolean(wallet.address)}
            onConnect={wallet.connect}
            ammData={amm.data}
            liquidity={liquidity}
          />

          <SystemActivityCard
            events={activity.events}
            allEvents={activity.allEvents}
            loading={activity.loading}
            onRefresh={activity.reloadEvents}
            title="Recent System Activity"
            description="Recent liquidity, swap, farming, and reward activity."
            scroll
          />
        </section>

        <section className="space-y-5 xl:col-span-3">
          <div className="xl:sticky xl:top-28">
            <RemoveLiquidityCard
              connected={Boolean(wallet.address)}
              onConnect={wallet.connect}
              ammData={amm.data}
              liquidity={liquidity}
            />
          </div>
        </section>
      </div>
    </main>
  );
}