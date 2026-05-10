import { Coins, Wallet } from "lucide-react";
import PageHero from "../../components/common/PageHero";

export default function FarmHeader({ connected, onConnect, stakingData }) {
  return (
    <PageHero
      badge="Yield Farming"
      icon={<Coins size={14} />}
      title="Stake LP tokens and"
      highlight="earn DRX rewards"
      description="Deposit your ALP liquidity provider tokens into the farming contract to earn DRX rewards over time."
      stats={[
        { label: "Available LP", value: `${stakingData.lpBalance} ALP` },
        { label: "Staked LP", value: `${stakingData.stakedBalance} ALP` },
        { label: "Pending DRX", value: `${stakingData.earnedReward} DRX` },
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