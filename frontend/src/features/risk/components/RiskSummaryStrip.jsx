export default function RiskSummaryStrip({ summary }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <SummaryCard label="Total Events" value={summary.total} />
      <SummaryCard label="Normal" value={summary.Normal} tone="success" />
      <SummaryCard label="Warning" value={summary.Warning} tone="warning" />
      <SummaryCard label="Suspicious" value={summary.Suspicious} tone="danger" />
    </div>
  );
}

function SummaryCard({ label, value, tone = "neutral" }) {
  const text =
    tone === "danger"
      ? "text-red-500"
      : tone === "warning"
      ? "text-amber-500"
      : tone === "success"
      ? "text-emerald-500"
      : "text-[var(--text)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-black ${text}`}>{value}</div>
    </div>
  );
}