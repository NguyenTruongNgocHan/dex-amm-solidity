import { ArrowUpDown, Coins, DatabaseZap, PieChart } from "lucide-react";

const items = [
  {
    icon: <ArrowUpDown size={20} />,
    title: "AMM Trading",
    desc: "Swap TokenA and TokenB directly through liquidity pools without centralized custody.",
  },
  {
    icon: <Coins size={20} />,
    title: "LP Token Ownership",
    desc: "Receive ERC20 LP tokens that represent your proportional share of the pool.",
  },
  {
    icon: <PieChart size={20} />,
    title: "Transparent Pricing",
    desc: "Show price impact, minimum received, slippage, and real-time reserve information.",
  },
  {
    icon: <DatabaseZap size={20} />,
    title: "Blockchain-backed",
    desc: "Every trade and liquidity action is executed on-chain through smart contracts.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.title}
          className="app-card rounded-[28px] p-6 transition hover:-translate-y-0.5"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            {item.icon}
          </div>

          <h3 className="text-xl font-black tracking-tight text-slate-950">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-500">{item.desc}</p>
        </article>
      ))}
    </section>
  );
}