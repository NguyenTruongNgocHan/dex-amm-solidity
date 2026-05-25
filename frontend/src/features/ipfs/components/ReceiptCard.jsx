import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Button from "../../../components/common/Button";
import { getGatewayUrl } from "../../../lib/ipfs";
import { copyText } from "../utils/downloadJson";
import { anchorStatusLabel, shortCid, shortHash } from "../utils/evidenceFormat";

export default function ReceiptCard({
  receipt,
  verifyResult,
  onVerify,
  onDownload,
}) {
  const gatewayUrl = getGatewayUrl(receipt.cid);
  const anchorStatus = receipt.anchorStatus || "legacy";
  const verified = verifyResult?.status === "verified";
  const warning = verifyResult?.status === "warning";
  const mismatch = verifyResult?.status === "mismatch";
  const failed = verifyResult?.status === "failed";

  return (
    <article className="group rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary-border)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="dex-chip dex-chip-success">Trade Receipt</span>
              <span className="dex-chip">{receipt.ipfsMode || "local"}</span>
              <AnchorBadge status={anchorStatus} />
              {verifyResult ? <VerifyBadge result={verifyResult} /> : null}
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="text-xl font-black text-[var(--text)]">
                {receipt.amountIn} {receipt.tokenIn}
              </span>
              <span className="pb-0.5 text-sm font-black text-[var(--muted)]">
                →
              </span>
              <span className="market-up text-xl font-black">
                {receipt.amountOut || receipt.minAmountOut} {receipt.tokenOut}
              </span>
            </div>

            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              Block #{receipt.blockNumber || "N/A"} · Subject{" "}
              <span className="font-mono">{shortHash(receipt.txHash)}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
            <Button variant="secondary" onClick={onVerify}>
              <ShieldCheck size={15} />
              Verify
            </Button>

            {receipt.cid ? (
              <Button variant="ghost" onClick={() => copyText(receipt.cid)}>
                <Copy size={15} />
                CID
              </Button>
            ) : null}

            <Button variant="ghost" onClick={onDownload}>
              <Download size={15} />
              JSON
            </Button>

            {gatewayUrl ? (
              <a
                href={gatewayUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-black text-[var(--text)] transition hover:-translate-y-0.5"
              >
                <ExternalLink size={15} />
                IPFS
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <EvidenceField
            label="Receipt Hash"
            value={receipt.receiptHash}
            strong
          />
          <EvidenceField
            label="On-chain Hash"
            value={receipt.evidenceContentHash}
          />
          <EvidenceField label="Evidence URI" value={receipt.evidenceURI} />
          <EvidenceField label="Anchor Tx" value={receipt.anchorTxHash} />
          <EvidenceField
            label="CID"
            value={receipt.cid ? shortCid(receipt.cid) : "N/A"}
          />
          <EvidenceField
            label="Wallet Privacy"
            value={receipt.walletHash ? shortHash(receipt.walletHash) : "Hashed"}
          />
        </div>

        {verifyResult ? (
          <VerificationPanel
            result={verifyResult}
            verified={verified}
            warning={warning}
            mismatch={mismatch}
            failed={failed}
          />
        ) : null}
      </div>
    </article>
  );
}

function EvidenceField({ label, value, strong = false }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/55 p-3">
      <div className="text-[11px] font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div
        className={`mt-1 break-all font-mono text-xs ${
          strong ? "text-[var(--text)]" : "text-[var(--muted)]"
        }`}
      >
        {value || "N/A"}
      </div>
    </div>
  );
}

function VerificationPanel({ result, verified, warning, mismatch, failed }) {
  const boxClass = verified
    ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]"
    : warning
    ? "border-amber-300 bg-amber-500/10 text-amber-600"
    : mismatch || failed
    ? "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]"
    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]";

  return (
    <div className={`rounded-2xl border p-3 text-xs font-semibold ${boxClass}`}>
      <div className="flex items-start gap-2">
        {verified ? (
          <CheckCircle2 size={16} />
        ) : mismatch || failed ? (
          <XCircle size={16} />
        ) : (
          <AlertTriangle size={16} />
        )}

        <div className="min-w-0">
          <div className="font-black">{result.message}</div>

          {result.onChainHash ? (
            <div className="mt-2 grid gap-1 break-all">
              <div>Type: {result.evidenceType}</div>
              <div>On-chain hash: {result.onChainHash}</div>
              <div>Expected hash: {result.expectedHash}</div>
              <div>Evidence URI: {result.evidenceURI}</div>
              <div>Submitter: {result.submitter}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AnchorBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "anchored") {
    return <span className="dex-chip dex-chip-success">Anchored</span>;
  }

  if (normalized === "anchor-failed") {
    return <span className="dex-chip">Anchor Failed</span>;
  }

  return <span className="dex-chip">Not Anchored</span>;
}

function VerifyBadge({ result }) {
  if (result.status === "verified") {
    return <span className="dex-chip dex-chip-success">Verified</span>;
  }

  if (result.status === "checking") {
    return <span className="dex-chip">Checking</span>;
  }

  if (result.status === "warning") {
    return <span className="dex-chip">Hash OK / URI Warning</span>;
  }

  return <span className="dex-chip">Mismatch</span>;
}