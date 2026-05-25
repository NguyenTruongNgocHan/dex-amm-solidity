import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import StatusBanner from "../components/common/StatusBanner";
import LiquidityPageLayout from "../features/liquidity/LiquidityPageLayout";
import useAMMData from "../hooks/useAMMData";
import useLiquidityActions from "../hooks/useLiquidityActions";
import useAccessProfile from "../hooks/useAccessProfile";

export default function LiquidityPage({
  onNavigate,
  wallet,
  activityRefreshKey,
  refreshActivity,
}) {
  const amm = useAMMData(wallet.provider, wallet.address, activityRefreshKey);

  const liquidity = useLiquidityActions(
    wallet.signer,
    async () => {
      await amm.reload();
      refreshActivity?.();
    },
    wallet.setStatus
  );

  const { profile } = useAccessProfile(wallet);

  return (
    <AppShell
      currentPage="liquidity"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        {profile.isLpApprovalRequired && !profile.canAddLiquidity ? (
          <StatusBanner
            type="warning"
            title="Verified Liquidity Provider required"
            message="This DEX is running in production policy mode. You can still trade, but adding liquidity requires admin approval with evidence stored through an IPFS URI."
          />
        ) : null}

        <LiquidityPageLayout
          ammData={amm.data}
          liquidity={liquidity}
          wallet={wallet}
          canAddLiquidity={profile.canAddLiquidity}
          lpPolicy={profile}
        />
      </PageContainer>
    </AppShell>
  );
}