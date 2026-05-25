export default function ForensicSummaryStrip({ summary }) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <SummaryCard label="Signals" value={summary.total} />
      <SummaryCard label="Critical" value={summary.Critical} tone="danger" />
      <SummaryCard label="High" value={summary.High} tone="warning" />
      <SummaryCard label="Medium" value={summary.Medium} tone="info" />
      <SummaryCard label="Low" value={summary.Low} />
    </div>
  );
}

function SummaryCard({ label, value, tone = "neutral" }) {
  const color =
    tone === "danger"
      ? "text-red-500"
      : tone === "warning"
      ? "text-amber-500"
      : tone === "info"
      ? "text-blue-500"
      : "text-[var(--text)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}