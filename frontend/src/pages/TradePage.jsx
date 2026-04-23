import AppShell from "../components/layout/AppShell";
import TradePageLayout from "../features/trade/TradePageLayout";

export default function TradePage({ onNavigate }) {
  return (
    <AppShell currentPage="trade" onNavigate={onNavigate}>
      <TradePageLayout />
    </AppShell>
  );
}