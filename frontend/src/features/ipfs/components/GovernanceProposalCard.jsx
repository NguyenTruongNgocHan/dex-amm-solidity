import { FileText, Lock, UploadCloud } from "lucide-react";
import Button from "../../../components/common/Button";

export default function GovernanceProposalCard({
  proposalTitle,
  setProposalTitle,
  proposalDescription,
  setProposalDescription,
  proposedFeeBps,
  setProposedFeeBps,
  onUpload,
  disabled = false,
  disabledReason = "",
}) {
  return (
    <section className="dex-panel p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--purple-soft)] text-[var(--purple)]">
          <FileText size={18} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--text)]">
              Governance Proposal
            </h3>
            <span className="dex-chip">Operator/Admin only</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Store off-chain proposal evidence for AMM governance documents.
            The smart contract only accepts this evidence type from Operator or Admin.
          </p>
        </div>
      </div>

      {disabled && disabledReason ? (
        <div className="mt-4 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-xs font-bold leading-5 text-[var(--warning)]">
          <Lock size={14} className="mr-2 inline" />
          {disabledReason}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <input
          value={proposalTitle}
          onChange={(event) => setProposalTitle(event.target.value)}
          className="input-shell px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
          placeholder="Proposal title"
          disabled={disabled}
        />

        <textarea
          value={proposalDescription}
          onChange={(event) => setProposalDescription(event.target.value)}
          className="input-shell min-h-[96px] resize-none px-4 py-3 text-sm text-[var(--text)] outline-none"
          placeholder="Proposal description"
          disabled={disabled}
        />

        <input
          value={proposedFeeBps}
          onChange={(event) => setProposedFeeBps(event.target.value)}
          className="input-shell px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
          placeholder="Proposed fee bps"
          disabled={disabled}
        />

        <Button onClick={onUpload} disabled={disabled}>
          <UploadCloud size={16} />
          Upload Proposal
        </Button>
      </div>
    </section>
  );
}