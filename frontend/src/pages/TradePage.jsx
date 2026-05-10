import AppShell from "../components/layout/AppShell";
import TradePageLayout from "../features/trade/TradePageLayout";
import useAMMData from "../hooks/useAMMData";
import useTradeActions from "../hooks/useTradeActions";
import useSystemEvents from "../hooks/useSystemEvents";

export default function TradePage({
  onNavigate,
  wallet,
  activityRefreshKey,
  refreshActivity,
}) {
  const amm = useAMMData(wallet.provider, wallet.address);
  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 8);

  const trade = useTradeActions(
    wallet.signer,
    async () => {
      await amm.reload();
      await activity.reloadEvents();
      refreshActivity?.();
    },
    wallet.setStatus
  );

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