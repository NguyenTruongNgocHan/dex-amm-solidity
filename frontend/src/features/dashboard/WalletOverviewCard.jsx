import { Wallet } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";
import { shortAddress } from "../../lib/format";

export default function WalletOverviewCard({ ammData, connected, address }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-3">
        <IconBadge tone="primary" className="h-10 w-10">
          <Wallet size={18} />
        </IconBadge>

        <div>
          <h3 className="text-[17px] font-bold text-[var(--text)]">
            Wallet Overview
          </h3>
          <p className="text-sm text-[var(--muted)]">
            {connected ? shortAddress(address) : "Not connected"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <BalanceRow label="TokenA Balance" value={connected ? ammData.tokenABalance : "—"} />
        <BalanceRow label="TokenB Balance" value={connected ? ammData.tokenBBalance : "—"} />
        <BalanceRow label="LP Token Balance" value={connected ? ammData.lpBalance : "—"} />
      </div>
    </SurfaceCard>
  );
}

function BalanceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="max-w-[150px] truncate text-right text-sm font-bold text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}