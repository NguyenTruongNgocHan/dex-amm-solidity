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
        <div className="text-sm text-[var(--muted)]">LP Balance</div>
        <div className="mt-2 text-[34px] font-bold leading-none text-teal-600 dark:text-teal-300">
          {connected ? ammData.lpBalance : "—"}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        LP tokens represent your share of the liquidity pool. Removing liquidity burns LP tokens and returns TokenA/TokenB.
      </p>
    </SurfaceCard>
  );
}