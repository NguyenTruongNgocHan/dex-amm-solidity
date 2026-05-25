import { Droplets } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import StatusBanner from "../components/common/StatusBanner";
import LiquidityPageLayout from "../features/liquidity/LiquidityPageLayout";
import useAMMData from "../hooks/useAMMData";
import useLiquidityActions from "../hooks/useLiquidityActions";
import useAccessProfile from "../hooks/useAccessProfile";
import { SYMBOLS } from "../config/contracts";

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
        <PageHero
          badge="Liquidity Provider Console"
          icon={<Droplets size={14} />}
          title="Provide liquidity and"
          highlight="earn pool fees"
          description={`Add ${SYMBOLS.tokenA} and ${SYMBOLS.tokenB} into the AMM pool, receive ${SYMBOLS.lpToken} tokens, and withdraw your proportional share whenever you want.`}
          stats={[
            {
              label: "Pool Status",
              value: amm.data.hasLiquidity ? "Active" : "Empty",
            },
            {
              label: `Your ${SYMBOLS.lpToken}`,
              value: `${amm.data.lpBalance} ${SYMBOLS.lpToken}`,
            },
            {
              label: "Pool Share",
              value: amm.data.poolShare,
            },
          ]}
        />

        <div className="mt-4 space-y-3">
          <StatusBanner message={wallet.status || amm.error} />

          {profile.isLpApprovalRequired && !profile.canAddLiquidity ? (
            <StatusBanner
              type="warning"
              title="Verified LP required"
              message="You can still trade, but adding liquidity requires admin approval with IPFS evidence."
            />
          ) : null}
        </div>

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