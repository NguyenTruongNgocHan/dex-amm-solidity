import SystemActivityCard from "../activity/SystemActivityCard";

export default function FarmPageLayout({
  position,
  stake,
  reward,
  explain,
  activity,
}) {
  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-12">
      <div className="xl:col-span-4">{position}</div>
      <div className="xl:col-span-4">{stake}</div>
      <div className="xl:col-span-4">{reward}</div>

      <div className="xl:col-span-4">{explain}</div>

      <div className="xl:col-span-8">
        <SystemActivityCard
          events={activity.events}
          allEvents={activity.allEvents}
          loading={activity.loading}
          onRefresh={activity.reloadEvents}
          title="Farm Activity Timeline"
          description="On-chain farming, staking, liquidity, swap, and reward activity."
          scroll
          maxHeight="360px"
        />
      </div>
    </section>
  );
}