import { Info, Repeat, Sprout, WalletCards } from "lucide-react";
import { SYMBOLS } from "../../config/contracts";

function Step({ icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
        {icon}
      </div>

      <div>
        <h3 className="font-black text-[var(--text)]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function FarmExplainCard() {
  return (
    <section className="h-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Info size={18} className="text-[var(--primary)]" />
        <h2 className="text-lg font-black text-[var(--text)]">
          How Yield Farming Works
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        <Step
          icon={<Repeat size={18} />}
          title="1. Add liquidity"
          description={`Deposit ${SYMBOLS.tokenA} and ${SYMBOLS.tokenB} into the AMM pool to receive ${SYMBOLS.lpToken}.`}
        />

        <Step
          icon={<Sprout size={18} />}
          title={`2. Stake ${SYMBOLS.lpToken}`}
          description={`Deposit your ${SYMBOLS.lpToken} into the farm contract. Your staked balance is used to calculate rewards.`}
        />

        <Step
          icon={<WalletCards size={18} />}
          title={`3. Earn ${SYMBOLS.rewardToken}`}
          description={`Claim ${SYMBOLS.rewardToken} rewards over time, then withdraw your ${SYMBOLS.lpToken} whenever you want.`}
        />
      </div>
    </section>
  );
}