import { Download, Lock, ShieldCheck, UploadCloud } from "lucide-react";
import Button from "../../../components/common/Button";

export default function ForensicReportPanel({
  report,
  anchorStatus,
  onDownload,
  onAnchor,
  canAnchor = false,
  roleLabel = "Disconnected",
}) {
  return (
    <section className="dex-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="dex-chip dex-chip-success">Auditor Report</div>
          <h3 className="mt-3 text-xl font-black text-[var(--text)]">
            Forensic Report
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Export the current forensic snapshot or anchor it as a Pool Audit
            Report evidence record. On-chain anchoring is restricted to Auditor/Admin.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="dex-chip">Current role: {roleLabel}</span>
            <span className="dex-chip">
              Anchor permission: {canAnchor ? "Allowed" : "Blocked"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onDownload}>
            <Download size={15} />
            Export JSON
          </Button>

          <Button onClick={onAnchor} disabled={!canAnchor}>
            <UploadCloud size={15} />
            Anchor Report
          </Button>
        </div>
      </div>

      {!canAnchor ? (
        <div className="mt-4 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-sm font-bold text-[var(--warning)]">
          <Lock size={16} className="mr-2 inline" />
          Only Auditor/Admin can anchor pool audit or forensic report evidence.
        </div>
      ) : null}

      {anchorStatus ? (
        <div className="mt-4 rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm font-black text-[var(--success)]">
          <ShieldCheck size={16} className="mr-2 inline" />
          {anchorStatus}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Mini label="Generated At" value={report.generatedAt} />
        <Mini label="Signals" value={report.summary.total} />
        <Mini label="Evidence Source" value="On-chain + IPFS Hash" />
      </div>
    </section>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <div className="text-[11px] font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 break-all text-sm font-bold text-[var(--text)]">
        {value}
      </div>
    </div>
  );
}