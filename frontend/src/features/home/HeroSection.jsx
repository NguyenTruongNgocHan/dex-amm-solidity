import { ArrowRight, Droplets, ShieldCheck, Wallet2 } from "lucide-react";
import Button from "../../components/common/Button";
import SectionBadge from "../../components/common/SectionBadge";

export default function HeroSection() {
  return (
    <section className="app-card-soft grid-bg relative overflow-hidden rounded-[32px] px-6 py-12 md:px-10 md:py-16">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <SectionBadge>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500" />
          Powered by Blockchain Technology
        </SectionBadge>

        <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
          Decentralized AMM
          <span className="block text-teal-700">Trading Platform</span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
          Trade tokenized assets through an automated market maker. Add liquidity,
          receive LP tokens, and swap assets with transparent on-chain pricing.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button className="gap-2 rounded-2xl px-7 py-4 text-base">
            Start Trading
            <ArrowRight size={18} />
          </Button>

          <Button
            variant="secondary"
            className="gap-2 rounded-2xl px-7 py-4 text-base"
          >
            Add Liquidity
          </Button>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <MiniHighlight
            icon={<Droplets size={18} />}
            title="AMM Liquidity"
            desc="Pool-based pricing with x*y=k"
          />
          <MiniHighlight
            icon={<Wallet2 size={18} />}
            title="Non-custodial"
            desc="Your assets stay in your wallet"
          />
          <MiniHighlight
            icon={<ShieldCheck size={18} />}
            title="Transparent Fees"
            desc="Visible fee and slippage preview"
          />
        </div>
      </div>
    </section>
  );
}

function MiniHighlight({ icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-teal-100 bg-white/80 px-5 py-5 text-left shadow-sm backdrop-blur">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {icon}
      </div>
      <div className="text-lg font-bold text-slate-900">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-500">{desc}</div>
    </div>
  );
}