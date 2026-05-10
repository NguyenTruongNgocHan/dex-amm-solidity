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

export default function TradePageLayout({ wallet, amm, trade, activity }) {
  const showStatus = wallet.status || amm.error;

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <PageHero
        badge="Live AMM Trading"
        icon={<ArrowDownUp size={14} />}
        title="Swap assets with"
        highlight="transparent pricing"
        description="Trade TKA and TKB through a constant product AMM. The interface previews fee, slippage, price impact, and pool reserves before you sign."
        stats={[
          { label: "Reserve TKA", value: amm.data.reserveA },
          { label: "Reserve TKB", value: amm.data.reserveB },
          { label: "Spot Price", value: `1 TKA = ${amm.data.priceAinB} TKB` },
        ]}
      />

      <StatusBanner message={showStatus} className="mt-5" />

      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <aside className="space-y-5 xl:col-span-3">
          <div className="xl:sticky xl:top-28 xl:space-y-5">
            <PortfolioSidebar
              ammData={amm.data}
              connected={Boolean(wallet.address)}
            />
            <MarketsSidebar ammData={amm.data} />
          </div>
        </aside>

        <section className="space-y-5 xl:col-span-6">
          <MarketOverviewCard
            ammData={amm.data}
            loading={amm.loading}
            activity={activity}
          />

          <PoolInsightStrip ammData={amm.data} activity={activity} />

          <TradeChartMock ammData={amm.data} />
        </section>

        <aside className="space-y-5 xl:col-span-3">
          <div className="xl:sticky xl:top-28">
            <TradePanelCard
              ammData={amm.data}
              connected={Boolean(wallet.address)}
              onConnect={wallet.connect}
              trade={trade}
            />
          </div>
        </aside>

        <section className="xl:col-span-12">
          <SystemActivityCard
            events={activity.events}
            allEvents={activity.allEvents}
            loading={activity.loading}
            onRefresh={activity.reloadEvents}
            title="Recent System Activity"
            description="Recent swap, liquidity, staking, and reward actions across the whole DEX."
            scroll
          />
        </section>
      </div>
    </main>
  );
}