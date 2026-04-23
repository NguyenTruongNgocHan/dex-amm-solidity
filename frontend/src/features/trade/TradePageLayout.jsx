import PortfolioSidebar from "./PortfolioSidebar";
import MarketsSidebar from "./MarketsSidebar";
import MarketOverviewCard from "./MarketOverviewCard";
import TradeChartMock from "../../components/charts/TradeChartMock";
import TradePanelCard from "./TradePanelCard";
import RecentTradesCard from "./RecentTradesCard";

export default function TradePageLayout() {
  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-6 py-5 xl:grid-cols-12">
      <aside className="space-y-5 xl:col-span-3">
        <PortfolioSidebar />
        <MarketsSidebar />
      </aside>

      <section className="space-y-5 xl:col-span-6">
        <MarketOverviewCard />
        <TradeChartMock />
      </section>

      <aside className="space-y-5 xl:col-span-3">
        <TradePanelCard />
        <RecentTradesCard />
      </aside>
    </main>
  );
}