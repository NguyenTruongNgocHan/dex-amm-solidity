import { Wallet } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";
import { shortAddress } from "../../lib/format";

export default function WalletOverviewCard({ ammData, connected, address }) {
  return (
    <SurfaceCard variant="panel" className="flex min-h-[330px] flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={connected ? "dex-chip dex-chip-success" : "dex-chip dex-chip-warning"}>
            {connected ? "Connected" : "Guest View"}
          </div>

          <h3 className="mt-3 text-xl font-black text-[var(--text)]">
            Wallet Overview
          </h3>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {connected
              ? shortAddress(address)
              : "Connect wallet to enable swap, liquidity and farming actions."}
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--purple-soft)] text-[var(--purple)]">
          <Wallet size={22} />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <Balance
          label={SYMBOLS.tokenA}
          value={connected ? ammData.balanceA : "—"}
          suffix={SYMBOLS.tokenA}
          tone="success"
        />
        <Balance
          label={SYMBOLS.tokenB}
          value={connected ? ammData.balanceB : "—"}
          suffix={SYMBOLS.tokenB}
          tone="blue"
        />
        <Balance
          label={SYMBOLS.lpToken}
          value={connected ? ammData.lpBalance : "—"}
          suffix={SYMBOLS.lpToken}
          tone="purple"
        />
      </div>

      <div className="mt-auto pt-4">
        <div className="surface-card-soft p-4 text-xs leading-5 text-[var(--muted)]">
          Wallet connection is the DApp authentication layer. No password-based
          account is required.
        </div>
      </div>
    </SurfaceCard>
  );
}

function Balance({ label, value, suffix, tone }) {
  const cls = {
    success: "market-up",
    blue: "text-[var(--blue)]",
    purple: "text-[var(--purple)]",
  }[tone];

  return (
    <div className="dex-stat">
      <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
        {label} Balance
      </p>
      <p className={`mt-1 truncate text-xl font-black ${cls}`}>
        {value} <span className="text-sm">{suffix}</span>
      </p>
    </div>
  );
}