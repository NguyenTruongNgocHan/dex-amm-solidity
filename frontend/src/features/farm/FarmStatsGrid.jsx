import { SYMBOLS } from "../../config/contracts";

function StatCard({ label, value, suffix, highlight }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm text-[var(--muted)]">{label}</p>

      <div
        className={`mt-2 text-2xl font-black ${
          highlight ? "text-[var(--primary)]" : "text-[var(--text)]"
        }`}
      >
        {value}
        {suffix ? <span className="ml-1 text-sm font-bold">{suffix}</span> : null}
      </div>
    </div>
  );
}

export default function FarmStatsGrid({ stakingData }) {
  return (
    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={`Available ${SYMBOLS.lpToken}`}
        value={stakingData.lpBalance}
        suffix={SYMBOLS.lpToken}
      />

      <StatCard
        label={`Staked ${SYMBOLS.lpToken}`}
        value={stakingData.stakedBalance}
        suffix={SYMBOLS.lpToken}
        highlight
      />

      <StatCard
        label={`Pending ${SYMBOLS.rewardToken}`}
        value={stakingData.earnedReward}
        suffix={SYMBOLS.rewardToken}
        highlight
      />

      <StatCard
        label={`Total ${SYMBOLS.lpToken} Staked`}
        value={stakingData.totalStaked}
        suffix={SYMBOLS.lpToken}
      />
    </section>
  );
}