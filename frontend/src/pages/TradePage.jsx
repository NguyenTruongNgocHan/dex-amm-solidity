import AppShell from "../components/layout/AppShell";
import TradePageLayout from "../features/trade/TradePageLayout";
import useAMMData from "../hooks/useAMMData";
import useTradeActions from "../hooks/useTradeActions";

export default function TradePage({ onNavigate, wallet }) {
  const amm = useAMMData(wallet.provider, wallet.address);
  const trade = useTradeActions(wallet.signer, amm.reload, wallet.setStatus);

  return (
    <AppShell
      currentPage="trade"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <TradePageLayout wallet={wallet} amm={amm} trade={trade} />
    </AppShell>
  );
}