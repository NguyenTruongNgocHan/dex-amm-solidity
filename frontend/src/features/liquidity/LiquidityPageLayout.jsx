import PoolSummaryCard from "./PoolSummaryCard";
import AddLiquidityCard from "./AddLiquidityCard";
import RemoveLiquidityCard from "./RemoveLiquidityCard";
import PositionCard from "./PositionCard";

export default function LiquidityPageLayout({ wallet, amm, liquidity }) {
  const showStatus = wallet.status || amm.error;

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-6 py-5 xl:grid-cols-12">
      {showStatus ? (
        <div className="xl:col-span-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {wallet.status || amm.error}
        </div>
      ) : null}

      <section className="space-y-5 xl:col-span-4">
        <PoolSummaryCard ammData={amm.data} loading={amm.loading} />
        <PositionCard ammData={amm.data} connected={Boolean(wallet.address)} />
      </section>

      <section className="space-y-5 xl:col-span-5">
        <AddLiquidityCard
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
          ammData={amm.data}
          liquidity={liquidity}
        />
      </section>

      <section className="space-y-5 xl:col-span-3">
        <RemoveLiquidityCard
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
          ammData={amm.data}
          liquidity={liquidity}
        />
      </section>
    </main>
  );
}