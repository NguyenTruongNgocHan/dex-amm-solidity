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
          <p className="text-sm text-[var(--muted)]">
            LP ownership and withdrawable tokens
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">Your Pool Share</div>
        <div className="mt-2 text-[32px] font-bold text-teal-600 dark:text-teal-300">
          {connected ? `${ammData.lpSharePercent}%` : "—"}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <MiniRow
          label="LP Token Balance"
          value={connected ? `${ammData.lpBalance} LPT` : "—"}
        />
        <MiniRow
          label="Total LP Supply"
          value={connected ? `${ammData.totalLiquidity} LPT` : "—"}
        />
        <MiniRow
          label="Withdrawable TKA"
          value={connected ? `${ammData.claimableA} TKA` : "—"}
          tone="success"
        />
        <MiniRow
          label="Withdrawable TKB"
          value={connected ? `${ammData.claimableB} TKB` : "—"}
          tone="success"
        />
        <MiniRow
          label="Wallet TKA"
          value={connected ? `${ammData.tokenABalance} TKA` : "—"}
        />
        <MiniRow
          label="Wallet TKB"
          value={connected ? `${ammData.tokenBBalance} TKB` : "—"}
        />
      </div>

      <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
        When you remove liquidity, the AMM burns your LP tokens and returns
        TokenA/TokenB based on your current pool ownership percentage.
      </div>
    </SurfaceCard>
  );
}

function MiniRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className={`max-w-[150px] truncate text-sm font-bold ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}