import AddLiquidityCard from "./AddLiquidityCard";
import PoolSummaryCard from "./PoolSummaryCard";
import PositionCard from "./PositionCard";
import RemoveLiquidityCard from "./RemoveLiquidityCard";
import SystemActivityCard from "../activity/SystemActivityCard";
import useSystemEvents from "../../hooks/useSystemEvents";

export default function LiquidityPageLayout({
  ammData,
  liquidity,
  wallet,
  canAddLiquidity = true,
  lpPolicy,
}) {
  const activity = useSystemEvents(wallet.provider, 0, 6);

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-12">
      <aside className="grid gap-5 xl:col-span-3">
        <PoolSummaryCard ammData={ammData} />

        <PositionCard
          ammData={ammData}
          connected={Boolean(wallet.address)}
          compact
        />
      </aside>

      <div className="flex xl:col-span-5">
        <AddLiquidityCard
          ammData={ammData}
          liquidity={liquidity}
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
          disabled={!canAddLiquidity}
          lpPolicy={lpPolicy}
        />
      </div>

      <div className="flex xl:col-span-4">
        <RemoveLiquidityCard
          ammData={ammData}
          liquidity={liquidity}
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
        />
      </div>

      <div className="xl:col-span-12">
        <SystemActivityCard
          events={activity.events}
          allEvents={activity.allEvents}
          loading={activity.loading}
          onRefresh={activity.reloadEvents}
          title="Liquidity Activity Timeline"
          description="On-chain liquidity operations, swaps, staking, and reward actions."
          scroll
          maxHeight="360px"
        />
      </div>
    </section>
  );
}