import { Gift, LogOut } from "lucide-react";

export default function FarmRewardCard({
  connected,
  onConnect,
  stakingData,
  actions,
}) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[var(--text)]">
            DRX Rewards
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Rewards accumulate while your LP remains staked.
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Gift size={20} />
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-teal-200 bg-teal-50 p-5">
        <p className="text-sm font-semibold text-teal-700">Pending Reward</p>
        <div className="mt-2 text-4xl font-black text-teal-700">
          {stakingData.earnedReward}
          <span className="ml-2 text-base">DRX</span>
        </div>

        <p className="mt-3 text-sm text-teal-700">
          Wallet DRX Balance:{" "}
          <span className="font-black">{stakingData.rewardBalance} DRX</span>
        </p>
      </div>

      {!connected ? (
        <button
          onClick={onConnect}
          className="mt-5 w-full rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={actions.claimReward}
            disabled={actions.pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Gift size={16} />
            Claim DRX
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