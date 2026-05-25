import { Layers } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

export default function LPPositionCard({ ammData, connected }) {
  const withdrawableA = ammData.withdrawableA ?? ammData.withdrawableTokenA ?? "0";
  const withdrawableB = ammData.withdrawableB ?? ammData.withdrawableTokenB ?? "0";

  return (
    <SurfaceCard variant="panel" className="flex min-h-[330px] flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="dex-chip">LP Position</div>
          <h3 className="mt-3 text-xl font-black text-[var(--text)]">
            Pool Ownership
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            LP tokens represent your proportional claim on reserves.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          <Layers size={22} />
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--primary-border)] bg-[var(--primary-soft)] p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
          Your Pool Share
        </p>
        <p className="mt-2 text-4xl font-black text-[var(--primary-dark)]">
          {connected ? `${ammData.lpSharePercent}%` : "—"}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <Row
          label={`${SYMBOLS.lpToken} Balance`}
          value={connected ? `${ammData.lpBalance} ${SYMBOLS.lpToken}` : "—"}
        />
        <Row
          label={`Withdraw ${SYMBOLS.tokenA}`}
          value={connected ? `${withdrawableA} ${SYMBOLS.tokenA}` : "—"}
          tone="success"
        />
        <Row
          label={`Withdraw ${SYMBOLS.tokenB}`}
          value={connected ? `${withdrawableB} ${SYMBOLS.tokenB}` : "—"}
          tone="blue"
        />
      </div>
    </SurfaceCard>
  );
}

function Row({ label, value, tone = "neutral" }) {
  const cls = {
    success: "market-up",
    blue: "text-[var(--blue)]",
    neutral: "text-[var(--text)]",
  }[tone];

  return (
    <div className="dex-stat flex items-center justify-between gap-4">
      <span className="truncate text-sm font-bold text-[var(--muted)]">{label}</span>
      <span className={`max-w-[160px] truncate text-right text-sm font-black ${cls}`}>
        {value}
      </span>
    </div>
  );
}