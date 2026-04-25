import AppShell from "../components/layout/AppShell";
import useAMMData from "../hooks/useAMMData";
import useAMMEvents from "../hooks/useAMMEvents";
import DashboardLayout from "../features/dashboard/DashboardLayout";

export default function DashboardPage({ onNavigate, wallet, activityRefreshKey }) {
  const amm = useAMMData(wallet.provider, wallet.address);
  const activity = useAMMEvents(wallet.provider, activityRefreshKey);

  return (
    <AppShell
      currentPage="dashboard"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
    >
      <DashboardLayout wallet={wallet} amm={amm} activity={activity} />
    </AppShell>
  );
}