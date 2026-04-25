import PortfolioSidebar from "./PortfolioSidebar";
import MarketsSidebar from "./MarketsSidebar";
import MarketOverviewCard from "./MarketOverviewCard";
import TradeChartMock from "../../components/charts/TradeChartMock";
import TradePanelCard from "./TradePanelCard";
import RecentTradesCard from "./RecentTradesCard";
import PoolInsightStrip from "./PoolInsightStrip";

export default function TradePageLayout({ wallet, amm, trade, activity }) {
  const showStatus = wallet.status || amm.error;

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-6 py-5 xl:grid-cols-12">
      {showStatus ? (
        <div className="xl:col-span-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {wallet.status || amm.error}
        </div>
      ) : null}

      <aside className="space-y-5 xl:col-span-3">
        <PortfolioSidebar
          ammData={amm.data}
          connected={Boolean(wallet.address)}
        />
        <MarketsSidebar ammData={amm.data} />
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
        <TradePanelCard
          ammData={amm.data}
          connected={Boolean(wallet.address)}
          onConnect={wallet.connect}
          trade={trade}
        />

        <RecentTradesCard
          events={activity.events}
          loading={activity.loading}
          onRefresh={activity.reloadEvents}
          compact
        />
      </aside>
    </main>
  );
}