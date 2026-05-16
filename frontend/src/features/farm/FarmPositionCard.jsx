import { BadgeDollarSign, Layers } from "lucide-react";
import { SYMBOLS } from "../../config/contracts";

function Row({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span
        className={`max-w-[180px] truncate text-right text-sm font-bold ${
          highlight ? "text-[var(--primary)]" : "text-[var(--text)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function FarmPositionCard({ stakingData, connected }) {
  const empty = !connected;

  return (
    <section className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
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
        <Row
          label={`Wallet ${SYMBOLS.lpToken}`}
          value={empty ? "—" : `${stakingData.lpBalance} ${SYMBOLS.lpToken}`}
        />
        <Row
          label={`Staked ${SYMBOLS.lpToken}`}
          value={empty ? "—" : `${stakingData.stakedBalance} ${SYMBOLS.lpToken}`}
          highlight
        />
        <Row
          label={`Pending ${SYMBOLS.rewardToken}`}
          value={empty ? "—" : `${stakingData.earnedReward} ${SYMBOLS.rewardToken}`}
          highlight
        />
        <Row
          label={`${SYMBOLS.rewardToken} Wallet`}
          value={empty ? "—" : `${stakingData.rewardBalance} ${SYMBOLS.rewardToken}`}
        />
      </div>

      <div className="mt-auto pt-5">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-800 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <BadgeDollarSign size={16} />
            What this means
          </div>
          Your {SYMBOLS.lpToken} proves that you provided liquidity. Staking it
          lets the farm calculate your share of {SYMBOLS.rewardToken} rewards.
        </div>
      </div>
    </section>
  );
}