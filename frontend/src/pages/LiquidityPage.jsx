import AppShell from "../components/layout/AppShell";
import useAMMData from "../hooks/useAMMData";
import useLiquidityActions from "../hooks/useLiquidityActions";
import useSystemEvents from "../hooks/useSystemEvents";
import LiquidityPageLayout from "../features/liquidity/LiquidityPageLayout";

export default function LiquidityPage({
  onNavigate,
  wallet,
  activityRefreshKey,
  refreshActivity,
}) {
  const amm = useAMMData(wallet.provider, wallet.address);
  const activity = useSystemEvents(wallet.provider, activityRefreshKey);

  const liquidity = useLiquidityActions(
    wallet.signer,
    async () => {
      await amm.reload();
      refreshActivity?.();
    },
    wallet.setStatus
  );

  return (
    <AppShell
      currentPage="liquidity"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <LiquidityPageLayout
        wallet={wallet}
        amm={amm}
        liquidity={liquidity}
        activity={activity}
      />
    </AppShell>
  );
}
