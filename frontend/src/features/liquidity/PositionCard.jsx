import { Coins } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function PositionCard({ ammData, connected }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-3">
        <IconBadge tone="soft" className="h-11 w-11">
          <Coins size={20} />
        </IconBadge>

        <div>
          <h3 className="text-[18px] font-bold text-[var(--text)]">
            Your Position
          </h3>
          <p className="text-sm text-[var(--muted)]">LP ownership</p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">Your LP Balance</div>
        <div className="mt-2 text-[32px] font-bold text-teal-600 dark:text-teal-300">
          {connected ? ammData.lpBalance : "—"} LPT
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <MiniRow label="TokenA Balance" value={connected ? ammData.tokenABalance : "—"} />
        <MiniRow label="TokenB Balance" value={connected ? ammData.tokenBBalance : "—"} />
      </div>
    </SurfaceCard>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="max-w-[140px] truncate text-sm font-bold text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}