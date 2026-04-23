import { ArrowUpDown, Coins, DatabaseZap, PieChart } from "lucide-react";

const items = [
  {
    icon: <ArrowUpDown size={18} />,
    title: "AMM Trading",
    desc: "Swap TokenA and TokenB through liquidity pools.",
  },
  {
    icon: <Coins size={18} />,
    title: "LP Tokens",
    desc: "Receive ERC20 LP tokens representing your pool share.",
  },
  {
    icon: <PieChart size={18} />,
    title: "Transparent Pricing",
    desc: "Show price impact, slippage, and reserve information.",
  },
  {
    icon: <DatabaseZap size={18} />,
    title: "Blockchain-backed",
    desc: "Trades and liquidity actions are executed on-chain.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.title} className="surface-card p-5">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
            {item.icon}
          </div>

          <h3 className="text-lg font-bold text-[var(--text)]">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {item.desc}
          </p>
        </article>
      ))}
    </section>
  );
}