import DashboardHeader from "./DashboardHeader";
import PoolAnalyticsCard from "./PoolAnalyticsCard";
import WalletOverviewCard from "./WalletOverviewCard";
import LPPositionCard from "./LPPositionCard";
import ActivityAnalyticsCard from "./ActivityAnalyticsCard";
import DashboardActivityCard from "./DashboardActivityCard";
import PriceOverviewCard from "./PriceOverviewCard";

export default function DashboardLayout({ wallet, amm, activity }) {
  const showStatus = wallet.status || amm.error;

  return (
    <main className="mx-auto max-w-7xl px-6 py-5">
      {showStatus ? (
        <div className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {wallet.status || amm.error}
        </div>
      ) : null}

      <DashboardHeader connected={Boolean(wallet.address)} onConnect={wallet.connect} />

      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <section className="space-y-5 xl:col-span-8">
          <div className="grid gap-5 md:grid-cols-2">
            <PoolAnalyticsCard ammData={amm.data} loading={amm.loading} />
            <PriceOverviewCard ammData={amm.data} />
          </div>

          <ActivityAnalyticsCard events={activity.events} />

          <DashboardActivityCard
            events={activity.events}
            loading={activity.loading}
            onRefresh={activity.reloadEvents}
          />
        </section>

        <aside className="space-y-5 xl:col-span-4">
          <WalletOverviewCard
            ammData={amm.data}
            connected={Boolean(wallet.address)}
            address={wallet.address}
          />

          <LPPositionCard
            ammData={amm.data}
            connected={Boolean(wallet.address)}
          />
        </aside>
      </div>
    </main>
  );
}