import { useState } from "react";
import useStakingData from "../hooks/useStakingData";
import useStakingActions from "../hooks/useStakingActions";

export default function FarmPage({ wallet, refreshActivity }) {
  const [amount, setAmount] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const stakingData = useStakingData(
    wallet.address,
    wallet.provider,
    refreshKey
  );

  const actions = useStakingActions(wallet.signer, () => {
    setRefreshKey((prev) => prev + 1);
    refreshActivity?.();
  });

  async function handleStake() {
    await actions.stake(amount);
    setAmount("");
  }

  async function handleWithdraw() {
    await actions.withdraw(amount);
    setAmount("");
  }

  async function handleClaim() {
    await actions.claimReward();
  }

  async function handleExit() {
    await actions.exit();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-[var(--text)]">
        LP Staking Farm
      </h1>

      <p className="mt-2 text-[var(--muted)]">
        Stake your LP Token to earn DRX rewards.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Your Farm Position
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>LP Balance</span>
              <span>{stakingData.lpBalance} ALP</span>
            </div>

            <div className="flex justify-between">
              <span>Staked LP</span>
              <span>{stakingData.stakedBalance} ALP</span>
            </div>

            <div className="flex justify-between">
              <span>Pending Reward</span>
              <span>{stakingData.earnedReward} DRX</span>
            </div>

            <div className="flex justify-between">
              <span>DRX Balance</span>
              <span>{stakingData.rewardBalance} DRX</span>
            </div>

            <div className="flex justify-between">
              <span>Total LP Staked</span>
              <span>{stakingData.totalStaked} ALP</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Manage Stake
          </h2>

          <input
            className="mt-4 w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
            placeholder="Amount of LP Token"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleStake}
              className="rounded-xl bg-[var(--primary)] px-4 py-3 text-white"
            >
              Stake
            </button>

            <button
              onClick={handleWithdraw}
              className="rounded-xl border border-[var(--border)] px-4 py-3"
            >
              Withdraw
            </button>

            <button
              onClick={handleClaim}
              className="rounded-xl border border-[var(--border)] px-4 py-3"
            >
              Claim DRX
            </button>

            <button
              onClick={handleExit}
              className="rounded-xl border border-red-300 px-4 py-3 text-red-500"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}