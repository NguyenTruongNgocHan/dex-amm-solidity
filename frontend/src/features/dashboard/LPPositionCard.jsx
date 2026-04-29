import { Coins } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function LPPositionCard({ ammData, connected }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-3">
        <IconBadge tone="soft" className="h-10 w-10">
          <Coins size={18} />
        </IconBadge>

        <div>
          <h3 className="text-[17px] font-bold text-[var(--text)]">
            LP Position
          </h3>
          <p className="text-sm text-[var(--muted)]">Your pool ownership</p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">Pool Share</div>
        <div className="mt-2 text-[34px] font-bold leading-none text-teal-600 dark:text-teal-300">
          {connected ? `${ammData.lpSharePercent}%` : "—"}
        </div>
        <div className="mt-2 text-xs text-[var(--muted)]">
          Based on your LP token balance / total pool liquidity.
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <InfoRow
          label="LP Balance"
          value={connected ? `${ammData.lpBalance} LPT` : "—"}
        />
        <InfoRow
          label="Total LP Supply"
          value={connected ? `${ammData.totalLiquidity} LPT` : "—"}
        />
        <InfoRow
          label="Withdrawable TKA"
          value={connected ? `${ammData.claimableA} TKA` : "—"}
          tone="success"
        />
        <InfoRow
          label="Withdrawable TKB"
          value={connected ? `${ammData.claimableB} TKB` : "—"}
          tone="success"
        />
      </div>

      <div className="mt-4 rounded-[14px] border border-teal-200 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
        LP tokens represent your ownership share in the AMM pool. When swaps
        happen, the 0.3% trading fee stays in the pool, so liquidity providers
        benefit as pool reserves grow.
      </div>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className={`max-w-[160px] truncate text-sm font-bold ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}