import AppShell from "../components/layout/AppShell";
import useAMMData from "../hooks/useAMMData";
import useAMMEvents from "../hooks/useAMMEvents";
import DashboardLayout from "../features/dashboard/DashboardLayout";
import IPFSPanelCard from "../features/ipfs/IPFSPanelCard";

export default function DashboardPage({
  onNavigate,
  wallet,
  activityRefreshKey,
}) {
  const amm = useAMMData(wallet.provider, wallet.address);
  const activity = useAMMEvents(wallet.provider, activityRefreshKey);

  return (
    <AppShell
      currentPage="dashboard"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <DashboardLayout wallet={wallet} amm={amm} activity={activity} />

        <IPFSPanelCard walletAddress={wallet.address} />
      </div>
    </AppShell>
  );
}