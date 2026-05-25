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
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
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

      <div className="space-y-6">
        <PoolSummaryCard ammData={ammData} />
        <PositionCard ammData={ammData} wallet={wallet} />
      </div>
    </div>
  );
}