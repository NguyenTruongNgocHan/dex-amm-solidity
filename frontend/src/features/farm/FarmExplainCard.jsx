import { Info, Repeat, Sprout } from "lucide-react";

function Step({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
        {icon}
      </div>

      <h3 className="font-black text-[var(--text)]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

export default function FarmExplainCard() {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Info size={18} className="text-[var(--primary)]" />
        <h2 className="text-lg font-black text-[var(--text)]">
          How Yield Farming Works
        </h2>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Step
          icon={<Repeat size={18} />}
          title="1. Add liquidity"
          description="Deposit TKA and TKB into the AMM pool to receive ALP liquidity provider tokens."
        />

        <Step
          icon={<Sprout size={18} />}
          title="2. Stake ALP"
          description="Deposit your ALP into the farm contract. Your staked balance is used to calculate rewards."
        />

        <Step
          icon={<Info size={18} />}
          title="3. Earn DRX"
          description="Claim DRX rewards over time, then withdraw your ALP whenever you want."
        />
      </div>
    </section>
  );
}