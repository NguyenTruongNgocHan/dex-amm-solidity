import { FileText, UploadCloud } from "lucide-react";
import Button from "../../../components/common/Button";

export default function GovernanceProposalCard({
  proposalTitle,
  setProposalTitle,
  proposalDescription,
  setProposalDescription,
  proposedFeeBps,
  setProposedFeeBps,
  onUpload,
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
            <span className="dex-chip">Proposal</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Store off-chain proposal evidence for AMM governance documents.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <input
          value={proposalTitle}
          onChange={(event) => setProposalTitle(event.target.value)}
          className="input-shell px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
          placeholder="Proposal title"
        />

        <textarea
          value={proposalDescription}
          onChange={(event) => setProposalDescription(event.target.value)}
          className="input-shell min-h-[96px] resize-none px-4 py-3 text-sm text-[var(--text)] outline-none"
          placeholder="Proposal description"
        />

        <input
          value={proposedFeeBps}
          onChange={(event) => setProposedFeeBps(event.target.value)}
          className="input-shell px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
          placeholder="Proposed fee bps"
        />

        <Button onClick={onUpload}>
          <UploadCloud size={16} />
          Upload Proposal
        </Button>
      </div>
    </section>
  );
}