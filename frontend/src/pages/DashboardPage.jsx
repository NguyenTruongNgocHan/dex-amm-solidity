import AppShell from "../components/layout/AppShell";
import useAMMData from "../hooks/useAMMData";
import useSystemEvents from "../hooks/useSystemEvents";
import DashboardLayout from "../features/dashboard/DashboardLayout";

export default function DashboardPage({
  onNavigate,
  wallet,
  activityRefreshKey,
}) {
  const amm = useAMMData(wallet.provider, wallet.address);
  const activity = useSystemEvents(wallet.provider, activityRefreshKey);

  return (
    <AppShell
      currentPage="dashboard"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <DashboardLayout wallet={wallet} amm={amm} activity={activity} />
    </AppShell>
  );
}
