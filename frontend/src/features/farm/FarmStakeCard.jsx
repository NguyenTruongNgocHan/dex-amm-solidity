import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { SYMBOLS } from "../../config/contracts";

function cleanNumber(value) {
  return String(value || "0").replaceAll(",", "");
}

export default function FarmStakeCard({
  connected,
  onConnect,
  stakingData,
  actions,
}) {
  const [amount, setAmount] = useState("");

  async function handleStake() {
    await actions.stake(amount);
    setAmount("");
  }

  async function handleWithdraw() {
    await actions.withdraw(amount);
    setAmount("");
  }

  function useMaxLP() {
    setAmount(cleanNumber(stakingData.lpBalance));
  }

  function useMaxStaked() {
    setAmount(cleanNumber(stakingData.stakedBalance));
  }

  return (
    <section className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-[var(--text)]">
          Manage {SYMBOLS.lpToken} Stake
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Stake {SYMBOLS.lpToken} to earn {SYMBOLS.rewardToken}, or withdraw
          your staked position anytime.
        </p>
      </div>

      <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--muted)]">
            {SYMBOLS.lpToken} Amount
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={useMaxLP}
              className="font-bold text-[var(--primary)]"
            >
              Max wallet
            </button>

            <span className="text-[var(--muted)]">/</span>

            <button
              type="button"
              onClick={useMaxStaked}
              className="font-bold text-[var(--primary)]"
            >
              Max staked
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.0"
            className="min-w-0 flex-1 bg-transparent text-2xl font-black text-[var(--text)] outline-none"
          />

          <span className="rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-sm font-black text-[var(--primary)]">
            {SYMBOLS.lpToken}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[var(--muted)]">
          <div>
            Wallet:{" "}
            <span className="font-bold text-[var(--text)]">
              {stakingData.lpBalance} {SYMBOLS.lpToken}
            </span>
          </div>

          <div className="text-right">
            Staked:{" "}
            <span className="font-bold text-[var(--text)]">
              {stakingData.stakedBalance} {SYMBOLS.lpToken}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-cyan-300">
          Farm logic
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Rewards are calculated from your staked {SYMBOLS.lpToken} balance and
          accumulated over time.
        </p>
      </div>

      {!connected ? (
        <button
          onClick={onConnect}
          className="mt-auto w-full rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
          <button
            onClick={handleStake}
            disabled={actions.pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownToLine size={16} />
            Stake
          </button>

          <button
            onClick={handleWithdraw}
            disabled={actions.pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm font-black text-[var(--text)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpFromLine size={16} />
            Withdraw
          </button>
        </div>
      )}
    </section>
  );
}