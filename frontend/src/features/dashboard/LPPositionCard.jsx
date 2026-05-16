import { Coins } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";
import { SYMBOLS } from "../../config/contracts";

export default function LPPositionCard({ ammData, connected }) {
  const withdrawableA =
    ammData.withdrawableA ?? ammData.withdrawableTokenA ?? ammData.claimableA ?? "0";
  const withdrawableB =
    ammData.withdrawableB ?? ammData.withdrawableTokenB ?? ammData.claimableB ?? "0";

  return (
    <SurfaceCard className="flex h-full flex-col p-5">
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
          label={`${SYMBOLS.lpToken} Balance`}
          value={connected ? `${ammData.lpBalance} ${SYMBOLS.lpToken}` : "—"}
        />
        <InfoRow
          label="Total LP Supply"
          value={connected ? `${ammData.totalLiquidity} ${SYMBOLS.lpToken}` : "—"}
        />
        <InfoRow
          label={`Withdrawable ${SYMBOLS.tokenA}`}
          value={connected ? `${withdrawableA} ${SYMBOLS.tokenA}` : "—"}
          tone="success"
        />
        <InfoRow
          label={`Withdrawable ${SYMBOLS.tokenB}`}
          value={connected ? `${withdrawableB} ${SYMBOLS.tokenB}` : "—"}
          tone="success"
        />
      </div>

      <div className="mt-auto pt-4">
        <div className="rounded-[14px] border border-teal-200 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
          LP tokens represent your ownership share in the AMM pool. Swap fees
          stay in the pool, so liquidity providers benefit as reserves grow.
        </div>
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