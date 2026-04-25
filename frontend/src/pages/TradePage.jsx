import AppShell from "../components/layout/AppShell";
import TradePageLayout from "../features/trade/TradePageLayout";
import useAMMData from "../hooks/useAMMData";

export default function TradePage({ onNavigate, wallet }) {
  const amm = useAMMData(wallet.provider, wallet.address);

  return (
    <AppShell
      currentPage="trade"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <TradePageLayout wallet={wallet} amm={amm} />
    </AppShell>
  );
}