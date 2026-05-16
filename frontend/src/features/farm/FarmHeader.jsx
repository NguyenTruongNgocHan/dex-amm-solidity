import { Coins, Wallet } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import { SYMBOLS } from "../../config/contracts";

export default function FarmHeader({ connected, onConnect, stakingData }) {
  return (
    <PageHero
      badge="Yield Farming"
      icon={<Coins size={14} />}
      title="Stake LP tokens and"
      highlight={`earn ${SYMBOLS.rewardToken} rewards`}
      description={`Deposit your ${SYMBOLS.lpToken} liquidity provider tokens into the farming contract to earn ${SYMBOLS.rewardToken} rewards over time.`}
      stats={[
        {
          label: `Available ${SYMBOLS.lpToken}`,
          value: `${stakingData.lpBalance} ${SYMBOLS.lpToken}`,
        },
        {
          label: `Staked ${SYMBOLS.lpToken}`,
          value: `${stakingData.stakedBalance} ${SYMBOLS.lpToken}`,
        },
        {
          label: `Pending ${SYMBOLS.rewardToken}`,
          value: `${stakingData.earnedReward} ${SYMBOLS.rewardToken}`,
        },
      ]}
      action={
        !connected ? (
          <button
            onClick={onConnect}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Wallet Connected
          </div>
        )
      }
    />
  );
}