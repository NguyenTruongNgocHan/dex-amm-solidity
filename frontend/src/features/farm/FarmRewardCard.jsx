import { Gift, LogOut } from "lucide-react";
import { SYMBOLS } from "../../config/contracts";

export default function FarmRewardCard({
  connected,
  onConnect,
  stakingData,
  actions,
}) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[var(--text)]">
            {SYMBOLS.rewardToken} Rewards
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Rewards accumulate while your {SYMBOLS.lpToken} remains staked.
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Gift size={20} />
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
          Pending Reward
        </p>

        <div className="mt-2 text-4xl font-black text-teal-700 dark:text-teal-300">
          {stakingData.earnedReward}
          <span className="ml-2 text-base">{SYMBOLS.rewardToken}</span>
        </div>

        <p className="mt-3 text-sm text-teal-700 dark:text-teal-300">
          Wallet {SYMBOLS.rewardToken} Balance:{" "}
          <span className="font-black">
            {stakingData.rewardBalance} {SYMBOLS.rewardToken}
          </span>
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <InfoRow
          label={`Earned ${SYMBOLS.rewardToken}`}
          value={`${stakingData.earnedReward} ${SYMBOLS.rewardToken}`}
          highlight
        />
        <InfoRow
          label={`Wallet ${SYMBOLS.rewardToken}`}
          value={`${stakingData.rewardBalance} ${SYMBOLS.rewardToken}`}
        />
        <InfoRow
          label={`Staked ${SYMBOLS.lpToken}`}
          value={`${stakingData.stakedBalance} ${SYMBOLS.lpToken}`}
        />
      </div>

      {!connected ? (
        <button
          onClick={onConnect}
          className="mt-auto w-full rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
          <button
            onClick={actions.claimReward}
            disabled={actions.pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Gift size={16} />
            Claim {SYMBOLS.rewardToken}
          </button>

          <button
            onClick={actions.exit}
            disabled={actions.pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={16} />
            Exit Farm
          </button>
        </div>
      )}
    </section>
  );
}

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-4 text-sm first:mt-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span
        className={`max-w-[190px] truncate text-right font-bold ${
          highlight ? "text-[var(--primary)]" : "text-[var(--text)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}