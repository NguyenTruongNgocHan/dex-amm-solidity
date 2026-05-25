import { Link2 } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

export default function PositionCard({ ammData, connected, compact = false }) {
  const withdrawableA = ammData.withdrawableA ?? ammData.withdrawableTokenA ?? "0";
  const withdrawableB = ammData.withdrawableB ?? ammData.withdrawableTokenB ?? "0";

  return (
    <SurfaceCard variant="panel" className="flex min-h-[300px] flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="dex-chip">Position</div>
          <h3 className="mt-3 text-lg font-black text-[var(--text)]">
            Your LP Share
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Ownership and claimable reserves
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--purple-soft)] text-[var(--purple)]">
          <Link2 size={20} />
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--primary-border)] bg-[var(--primary-soft)] p-4">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
          Pool Share
        </p>
        <p className="mt-2 text-3xl font-black text-[var(--primary-dark)]">
          {connected ? `${ammData.lpSharePercent}%` : "—"}
        </p>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "text-sm" : ""}`}>
        <InfoRow
          label={`${SYMBOLS.lpToken}`}
          value={connected ? `${ammData.lpBalance} ${SYMBOLS.lpToken}` : "—"}
        />
        <InfoRow
          label={SYMBOLS.tokenA}
          value={connected ? `${withdrawableA} ${SYMBOLS.tokenA}` : "—"}
          tone="success"
        />
        <InfoRow
          label={SYMBOLS.tokenB}
          value={connected ? `${withdrawableB} ${SYMBOLS.tokenB}` : "—"}
          tone="blue"
        />
      </div>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const cls = {
    success: "market-up",
    blue: "text-[var(--blue)]",
    neutral: "text-[var(--text)]",
  }[tone];

  return (
    <div className="dex-stat flex items-center justify-between gap-3">
      <span className="truncate text-sm font-bold text-[var(--muted)]">{label}</span>
      <span className={`max-w-[140px] truncate text-right text-sm font-black ${cls}`}>
        {value}
      </span>
    </div>
  );
}