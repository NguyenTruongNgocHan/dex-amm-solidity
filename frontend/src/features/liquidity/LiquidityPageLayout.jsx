import { Droplets } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import StatusBanner from "../../components/common/StatusBanner";
import PoolSummaryCard from "./PoolSummaryCard";
import AddLiquidityCard from "./AddLiquidityCard";
import RemoveLiquidityCard from "./RemoveLiquidityCard";
import PositionCard from "./PositionCard";
import SystemActivityCard from "../activity/SystemActivityCard";
import { SYMBOLS } from "../../config/contracts";

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
        description={`Add ${SYMBOLS.tokenA} and ${SYMBOLS.tokenB} into the pool, receive ${SYMBOLS.lpToken} liquidity provider tokens, and withdraw your proportional share whenever you want.`}
        stats={[
          {
            label: "Pool Status",
            value: amm.data.hasLiquidity ? "Active" : "Empty",
          },
          {
            label: "Your LP",
            value: `${amm.data.lpBalance} ${SYMBOLS.lpToken}`,
          },
          {
            label: "Pool Share",
            value: `${amm.data.lpSharePercent}%`,
          },
        ]}
      />

      <StatusBanner message={showStatus} className="mt-5" />

      <section className="mt-6 grid gap-5 xl:grid-cols-12 xl:items-stretch">
        <div className="xl:col-span-4">
          <div className="grid h-full gap-5">
            <PoolSummaryCard ammData={amm.data} loading={amm.loading} compact />
            <PositionCard
              ammData={amm.data}
              connected={Boolean(wallet.address)}
              compact
            />
          </div>
        </div>

        <div className="h-full xl:col-span-4">
          <AddLiquidityCard
            connected={Boolean(wallet.address)}
            onConnect={wallet.connect}
            ammData={amm.data}
            liquidity={liquidity}
            balanced
          />
        </div>

        <div className="h-full xl:col-span-4">
          <RemoveLiquidityCard
            connected={Boolean(wallet.address)}
            onConnect={wallet.connect}
            ammData={amm.data}
            liquidity={liquidity}
            balanced
          />
        </div>
      </section>

      <section className="mt-5">
        <SystemActivityCard
          events={activity.events}
          allEvents={activity.allEvents}
          loading={activity.loading}
          onRefresh={activity.reloadEvents}
          title="Liquidity Activity Timeline"
          description="On-chain activity for liquidity operations, swaps, staking, and reward actions."
          scroll
          maxHeight="360px"
        />
      </section>
    </main>
  );
}