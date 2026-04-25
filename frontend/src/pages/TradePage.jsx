import AppShell from "../components/layout/AppShell";
import TradePageLayout from "../features/trade/TradePageLayout";
import useAMMData from "../hooks/useAMMData";
import useTradeActions from "../hooks/useTradeActions";
import useAMMEvents from "../hooks/useAMMEvents";

export default function TradePage({
  onNavigate,
  wallet,
  activityRefreshKey,
  refreshActivity,
}) {
  const amm = useAMMData(wallet.provider, wallet.address);

  const trade = useTradeActions(wallet.signer, async () => {
    await amm.reload();
    refreshActivity?.();
  }, wallet.setStatus);

  const activity = useAMMEvents(wallet.provider, activityRefreshKey);

  return (
    <AppShell
      currentPage="trade"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <TradePageLayout
        wallet={wallet}
        amm={amm}
        trade={trade}
        activity={activity}
      />
    </AppShell>
  );
}