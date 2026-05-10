import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

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
    setAmount(stakingData.lpBalance || "0");
  }

  function useMaxStaked() {
    setAmount(stakingData.stakedBalance || "0");
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-[var(--text)]">
          Manage LP Stake
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Stake LP to earn DRX, or withdraw your staked LP anytime.
        </p>
      </div>

      <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--muted)]">LP Amount</span>

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
            ALP
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[var(--muted)]">
          <div>
            Wallet LP:{" "}
            <span className="font-bold text-[var(--text)]">
              {stakingData.lpBalance}
            </span>
          </div>

          <div className="text-right">
            Staked LP:{" "}
            <span className="font-bold text-[var(--text)]">
              {stakingData.stakedBalance}
            </span>
          </div>
        </div>
      </div>

      {!connected ? (
        <button
          onClick={onConnect}
          className="mt-5 w-full rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
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