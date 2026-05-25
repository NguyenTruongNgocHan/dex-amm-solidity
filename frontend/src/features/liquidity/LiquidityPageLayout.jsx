import AddLiquidityCard from "./AddLiquidityCard";
import PoolSummaryCard from "./PoolSummaryCard";
import PositionCard from "./PositionCard";
import RemoveLiquidityCard from "./RemoveLiquidityCard";

export default function LiquidityPageLayout({
  ammData,
  liquidity,
  wallet,
  canAddLiquidity = true,
  lpPolicy,
}) {
  return (
    <section className="mt-6 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <div className="grid gap-5 xl:auto-rows-fr">
        <AddLiquidityCard
          ammData={ammData}
          liquidity={liquidity}
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
          disabled={!canAddLiquidity}
          lpPolicy={lpPolicy}
        />

        <RemoveLiquidityCard
          ammData={ammData}
          liquidity={liquidity}
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
        />
      </div>

      <aside className="grid gap-5 xl:grid-rows-[minmax(320px,1fr)_minmax(320px,1fr)]">
        <PoolSummaryCard ammData={ammData} />
        <PositionCard ammData={ammData} wallet={wallet} />
      </aside>
    </section>
  );
}