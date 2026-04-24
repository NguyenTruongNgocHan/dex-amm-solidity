import PortfolioSidebar from "./PortfolioSidebar";
import MarketsSidebar from "./MarketsSidebar";
import MarketOverviewCard from "./MarketOverviewCard";
import TradeChartMock from "../../components/charts/TradeChartMock";
import TradePanelCard from "./TradePanelCard";
import RecentTradesCard from "./RecentTradesCard";

export default function TradePageLayout({ wallet, amm, trade }) {
  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-6 py-5 xl:grid-cols-12">
      {wallet.status ? (
        <div className="xl:col-span-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {wallet.status}
        </div>
      ) : null}

      <aside className="space-y-5 xl:col-span-3">
        <PortfolioSidebar ammData={amm.data} />
        <MarketsSidebar ammData={amm.data} />
      </aside>

      <section className="space-y-5 xl:col-span-6">
        <MarketOverviewCard ammData={amm.data} loading={amm.loading} />
        <TradeChartMock ammData={amm.data} />
      </section>

      <aside className="space-y-5 xl:col-span-3">
        <TradePanelCard
          wallet={wallet}
          ammData={amm.data}
          trade={trade}
        />
        <RecentTradesCard />
      </aside>
    </main>
  );
}