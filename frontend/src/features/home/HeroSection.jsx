import { ArrowRight, Droplets, ShieldCheck, Wallet2 } from "lucide-react";
import Button from "../../components/common/Button";

export default function HeroSection({ onNavigate }) {
  return (
    <section className="surface-card-soft relative overflow-hidden px-8 py-12 md:px-14 md:py-16">
      <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-400/10" />
      <div className="absolute -right-10 top-0 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-400/10" />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary-dark)] dark:bg-[var(--surface)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
          Powered by Blockchain Technology
        </div>

        <h1 className="mt-6 text-5xl font-black tracking-tight text-[var(--text)] md:text-7xl">
          Blockchain AMM
          <span className="block text-[var(--primary-dark)]">
            Trading Platform
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          Trade tokenized assets through an automated market maker. Add liquidity,
          receive LP tokens, and swap assets with transparent on-chain pricing.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            className="gap-2 px-6 py-3 text-base"
            onClick={() => onNavigate?.("trade")}
          >
            Start Trading
            <ArrowRight size={18} />
          </Button>

          <Button variant="secondary" className="px-6 py-3 text-base">
            Add Liquidity
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <MiniPill
            icon={<Droplets size={16} />}
            title="AMM Liquidity"
            desc="Pool-based pricing with x*y=k"
          />
          <MiniPill
            icon={<Wallet2 size={16} />}
            title="Non-custodial"
            desc="Your assets stay in your wallet"
          />
          <MiniPill
            icon={<ShieldCheck size={16} />}
            title="Transparent Fees"
            desc="Visible fee and slippage preview"
          />
        </div>
      </div>
    </section>
  );
}

function MiniPill({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-left">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
        {icon}
      </div>
      <div className="text-base font-bold text-[var(--text)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{desc}</div>
    </div>
  );
}