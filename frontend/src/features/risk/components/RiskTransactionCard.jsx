import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { riskTone } from "../utils/riskRules";

export default function RiskTransactionCard({ row }) {
  const tone = riskTone(row.risk.level);

  return (
    <article className={`rounded-[26px] border p-4 ${tone.card}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${tone.pill}`}>
              {row.risk.level}
            </span>

            <span className="dex-chip">{row.type}</span>

            <span className="dex-chip">
              Risk Score {row.risk.score}/100
            </span>
          </div>

          <h3 className="mt-3 text-lg font-black text-[var(--text)]">
            {row.title || row.type}
          </h3>

          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
            Actor: {row.user || row.actor || "Protocol"} · Block{" "}
            {row.blockNumber ? `#${row.blockNumber}` : "N/A"}
          </p>

          <p className="mt-1 break-all font-mono text-xs text-[var(--muted)]">
            {row.txHash || row.id}
          </p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--text)]">
          {row.risk.level === "Suspicious" ? (
            <ShieldAlert size={22} className="text-red-500" />
          ) : row.risk.level === "Warning" ? (
            <AlertTriangle size={22} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={22} className="text-emerald-500" />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {row.risk.reasons.map((reason, index) => (
          <div
            key={`${row.id}-reason-${index}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-3 text-sm font-semibold text-[var(--muted)]"
          >
            {reason}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Mini label="Primary" value={row.primary || row.amountIn || "N/A"} />
        <Mini label="Secondary" value={row.secondary || row.amountOut || "N/A"} />
        <Mini label="Source" value={row.source || "on-chain"} />
      </div>
    </article>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3">
      <div className="text-[11px] font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 break-all text-sm font-bold text-[var(--text)]">
        {value}
      </div>
    </div>
  );
}