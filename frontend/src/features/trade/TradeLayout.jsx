import PortfolioCard from "./PortfolioCard";
import MarketList from "./MarketList";
import TradeStats from "./TradeStats";
import TradePanel from "./TradePanel";
import RecentTrades from "./RecentTrades";

export default function TradeLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px minmax(0, 1fr) 340px",
        gap: 20,
        alignItems: "start",
      }}
    >
      <div>
        <PortfolioCard />
        <MarketList />
      </div>

      <div>
        <TradeStats />
      </div>

      <div>
        <TradePanel />
        <RecentTrades />
      </div>
    </div>
  );
}