import { ArrowDownUp } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import StatusBanner from "../../components/common/StatusBanner";
import PortfolioSidebar from "./PortfolioSidebar";
import MarketsSidebar from "./MarketsSidebar";
import MarketOverviewCard from "./MarketOverviewCard";
import PoolPriceChart from "../../components/charts/PoolPriceChart";
import TradePanelCard from "./TradePanelCard";
import PoolInsightStrip from "./PoolInsightStrip";
import SystemActivityCard from "../activity/SystemActivityCard";
import PageContainer from "../../components/layout/PageContainer";
import { SYMBOLS } from "../../config/contracts";

export default function TradePageLayout({ wallet, amm, trade, activity }) {
  const showStatus = wallet.status || amm.error;

  return (
    <PageContainer>
      <PageHero
        badge="Live AMM Trading"
        icon={<ArrowDownUp size={14} />}
        title="Swap assets with"
        highlight="transparent pricing"
        description={`Trade ${SYMBOLS.tokenA} and ${SYMBOLS.tokenB} through a constant-product AMM. Preview fee, slippage protection, price impact, and reserve movement before signing.`}
        stats={[
          { label: `Reserve ${SYMBOLS.tokenA}`, value: amm.data.reserveA },
          { label: `Reserve ${SYMBOLS.tokenB}`, value: amm.data.reserveB },
          {
            label: "Spot Price",
            value: `1 ${SYMBOLS.tokenA} = ${amm.data.priceAinB} ${SYMBOLS.tokenB}`,
          },
        ]}
      />

      <div className="mt-4">
        <StatusBanner message={showStatus} />
      </div>

      <section className="mt-6 grid items-stretch gap-5 xl:grid-cols-[260px_minmax(0,1fr)_380px]">
        <aside className="grid min-h-[720px] gap-5 xl:grid-rows-2">
          <PortfolioSidebar
            ammData={amm.data}
            connected={Boolean(wallet.address)}
          />
          <MarketsSidebar ammData={amm.data} />
        </aside>

        <section className="grid min-h-[720px] gap-5">
          <MarketOverviewCard
            ammData={amm.data}
            loading={amm.loading}
            activity={activity}
          />

          <PoolInsightStrip ammData={amm.data} activity={activity} />

          <PoolPriceChart ammData={amm.data} />
        </section>

        <aside className="flex min-h-[720px]">
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
          wallet={wallet}
          title="Trade Activity Timeline"
          description="On-chain timeline for swaps, liquidity updates, staking, and reward actions."
          scroll
          maxHeight="360px"
        />
      </section>
    </PageContainer>
  );
}