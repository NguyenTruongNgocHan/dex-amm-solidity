import { AlertTriangle, ShieldAlert, SignalHigh } from "lucide-react";

function levelClass(level) {
  if (level === "Critical") return "border-red-400/60 bg-red-500/10";
  if (level === "High") return "border-amber-400/60 bg-amber-500/10";
  if (level === "Medium") return "border-blue-400/60 bg-blue-500/10";
  return "border-[var(--border)] bg-[var(--surface-soft)]";
}

function levelPill(level) {
  if (level === "Critical") return "border-red-300 bg-red-500/10 text-red-500";
  if (level === "High") return "border-amber-300 bg-amber-500/10 text-amber-500";
  if (level === "Medium") return "border-blue-300 bg-blue-500/10 text-blue-500";
  return "border-emerald-300 bg-emerald-500/10 text-emerald-500";
}

export default function ForensicSignalCard({ signal }) {
  return (
    <article className={`rounded-[26px] border p-4 ${levelClass(signal.level)}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${levelPill(
                signal.level
              )}`}
            >
              {signal.level}
            </span>
            <span className="dex-chip">{signal.type}</span>
          </div>

          <h3 className="mt-3 text-lg font-black text-[var(--text)]">
            {signal.title}
          </h3>

          <p className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">
            {signal.description}
          </p>

          <p className="mt-2 break-all font-mono text-xs text-[var(--muted)]">
            Tx: {signal.txHash}
          </p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface)]">
          {signal.level === "Critical" ? (
            <ShieldAlert size={22} className="text-red-500" />
          ) : signal.level === "High" ? (
            <AlertTriangle size={22} className="text-amber-500" />
          ) : (
            <SignalHigh size={22} className="text-blue-500" />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {signal.evidence.map((item, index) => (
          <div
            key={`${signal.id}-evidence-${index}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-3 text-sm font-semibold text-[var(--muted)]"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3">
        <div className="text-[11px] font-black uppercase tracking-wide text-[var(--muted)]">
          Auditor Recommendation
        </div>
        <div className="mt-1 text-sm font-bold text-[var(--text)]">
          {signal.recommendation}
        </div>
      </div>
    </article>
  );
}