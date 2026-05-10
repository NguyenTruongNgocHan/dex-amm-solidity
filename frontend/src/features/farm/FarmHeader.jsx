import { Coins, Wallet } from "lucide-react";

export default function FarmHeader({ connected, onConnect }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Coins size={14} />
            Yield Farming
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
            LP Staking Farm
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Stake your AMM LP Token to earn DRX rewards. This adds a simple
            yield farming layer on top of the liquidity pool.
          </p>
        </div>

        {!connected ? (
          <button
            onClick={onConnect}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
            Wallet Connected
          </div>
        )}
      </div>
    </section>
  );
}