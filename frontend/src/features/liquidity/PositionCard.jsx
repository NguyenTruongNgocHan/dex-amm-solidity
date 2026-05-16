import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

export default function PositionCard({ ammData, connected, compact = false }) {
  const empty = !connected;

  const withdrawableA =
    ammData.withdrawableA ?? ammData.withdrawableTokenA ?? "0";

  const withdrawableB =
    ammData.withdrawableB ?? ammData.withdrawableTokenB ?? "0";

  return (
    <SurfaceCard className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          🔗
        </div>

        <div>
          <h3 className="text-lg font-bold text-[var(--text)]">
            Your Position
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Pool ownership and withdrawable tokens
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-4">
        <p className="text-sm text-[var(--muted)]">Your Pool Share</p>
        <p className="mt-2 text-4xl font-black text-[var(--primary)]">
          {empty ? "—" : `${ammData.lpSharePercent}%`}
        </p>
      </div>

      <div className={`mt-4 grid gap-2 ${compact ? "text-sm" : ""}`}>
        <InfoRow
          label={`${SYMBOLS.lpToken} Balance`}
          value={empty ? "—" : `${ammData.lpBalance} ${SYMBOLS.lpToken}`}
        />
        <InfoRow
          label="Total LP Supply"
          value={empty ? "—" : `${ammData.totalLiquidity} ${SYMBOLS.lpToken}`}
        />
        <InfoRow
          label={`Withdrawable ${SYMBOLS.tokenA}`}
          value={empty ? "—" : `${withdrawableA} ${SYMBOLS.tokenA}`}
          highlight
        />
        <InfoRow
          label={`Withdrawable ${SYMBOLS.tokenB}`}
          value={empty ? "—" : `${withdrawableB} ${SYMBOLS.tokenB}`}
          highlight
        />
      </div>

      <div className="mt-auto pt-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--muted)]">
          Your {SYMBOLS.lpToken} represents your share of the pool. Removing
          liquidity burns LP tokens and returns {SYMBOLS.tokenA}/
          {SYMBOLS.tokenB} based on the current reserve ratio.
        </div>
      </div>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-[var(--muted)]">{label}</span>
      <span
        className={`max-w-[170px] truncate text-right font-bold ${
          highlight ? "text-[var(--primary)]" : "text-[var(--text)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}