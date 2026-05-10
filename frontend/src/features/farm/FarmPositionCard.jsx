import { BadgeDollarSign, Layers } from "lucide-react";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-sm font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}

export default function FarmPositionCard({ stakingData }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Layers size={20} />
        </div>

        <div>
          <h2 className="text-lg font-black text-[var(--text)]">
            Your Farm Position
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Overview of your LP and reward balances.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Row label="Wallet LP Balance" value={`${stakingData.lpBalance} ALP`} />
        <Row label="Staked LP Balance" value={`${stakingData.stakedBalance} ALP`} />
        <Row label="Pending Reward" value={`${stakingData.earnedReward} DRX`} />
        <Row label="DRX Wallet Balance" value={`${stakingData.rewardBalance} DRX`} />
      </div>

      <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-800">
        <div className="mb-1 flex items-center gap-2 font-bold">
          <BadgeDollarSign size={16} />
          What this means
        </div>
        Your LP Token proves that you provided liquidity. Staking it lets the
        farm calculate your share of DRX rewards over time.
      </div>
    </section>
  );
}