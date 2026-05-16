import { ArrowDownUp } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import StatusBanner from "../../components/common/StatusBanner";
import PortfolioSidebar from "./PortfolioSidebar";
import MarketsSidebar from "./MarketsSidebar";
import MarketOverviewCard from "./MarketOverviewCard";
import TradeChartMock from "../../components/charts/TradeChartMock";
import TradePanelCard from "./TradePanelCard";
import PoolInsightStrip from "./PoolInsightStrip";
import SystemActivityCard from "../activity/SystemActivityCard";
import { SYMBOLS } from "../../config/contracts";

export default function TradePageLayout({ wallet, amm, trade, activity }) {
  const showStatus = wallet.status || amm.error;

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <PageHero
        badge="Live AMM Trading"
        icon={<ArrowDownUp size={14} />}
        title="Swap assets with"
        highlight="transparent pricing"
        description={`Trade ${SYMBOLS.tokenA} and ${SYMBOLS.tokenB} through a constant product AMM. Preview fee, slippage, price impact, and pool reserves before signing.`}
        stats={[
          {
            label: `Reserve ${SYMBOLS.tokenA}`,
            value: amm.data.reserveA,
          },
          {
            label: `Reserve ${SYMBOLS.tokenB}`,
            value: amm.data.reserveB,
          },
          {
            label: "Spot Price",
            value: `1 ${SYMBOLS.tokenA} = ${amm.data.priceAinB} ${SYMBOLS.tokenB}`,
          },
        ]}
      />

      <StatusBanner message={showStatus} className="mt-5" />

      <section className="mt-6 grid gap-5 xl:grid-cols-12 xl:items-stretch">
        <aside className="xl:col-span-3">
          <div className="grid h-full gap-5">
            <PortfolioSidebar
              ammData={amm.data}
              connected={Boolean(wallet.address)}
            />
            <MarketsSidebar ammData={amm.data} />
          </div>
        </aside>

        <section className="xl:col-span-6">
          <div className="grid h-full gap-5">
            <MarketOverviewCard
              ammData={amm.data}
              loading={amm.loading}
              activity={activity}
            />
            <PoolInsightStrip ammData={amm.data} activity={activity} />
            <TradeChartMock ammData={amm.data} />
          </div>
        </section>

        <aside className="xl:col-span-3">
          <TradePanelCard
            ammData={amm.data}
            connected={Boolean(wallet.address)}
            onConnect={wallet.connect}
            trade={trade}
          />
        </aside>
      </section>

      <section className="mt-5">
        <SystemActivityCard
          events={activity.events}
          allEvents={activity.allEvents}
          loading={activity.loading}
          onRefresh={activity.reloadEvents}
          title="Trade Activity Timeline"
          description="On-chain timeline for swaps, liquidity updates, staking, and reward actions."
          scroll
          maxHeight="360px"
        />
      </section>
    </main>
  );
}