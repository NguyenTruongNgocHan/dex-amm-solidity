import { Download, RefreshCcw, ShieldCheck } from "lucide-react";
import Button from "../../../components/common/Button";
import ReceiptCard from "./ReceiptCard";

export default function TradeReceiptsPanel({
  receipts,
  verifyResults,
  onVerifyReceipt,
  onRefresh,
  onDownloadAll,
  onDownloadReceipt,
}) {
  const anchoredCount = receipts.filter(
    (receipt) => receipt.anchorStatus === "anchored"
  ).length;

  const verifiedCount = Object.values(verifyResults).filter(
    (result) => result.status === "verified"
  ).length;

  return (
    <section className="dex-panel overflow-hidden p-0">
      <div className="border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(59,130,246,0.06))] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="dex-chip dex-chip-success">Anchored Receipts</div>
            <h3 className="mt-3 text-2xl font-black text-[var(--text)]">
              Trade Receipts
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Each receipt is stored off-chain, then its hash is anchored
              on-chain. Verify checks whether local/IPFS content still matches
              the blockchain evidence record.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={onRefresh}>
              <RefreshCcw size={15} />
              Refresh
            </Button>

            <Button onClick={onDownloadAll} disabled={receipts.length === 0}>
              <Download size={15} />
              Download All
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryPill label="Receipts" value={receipts.length} />
          <SummaryPill label="Anchored" value={anchoredCount} />
          <SummaryPill label="Verified" value={verifiedCount} />
        </div>
      </div>

      <div className="scroll-panel grid max-h-[620px] gap-3 overflow-auto p-4">
        {receipts.length === 0 ? (
          <div className="empty-state min-h-[220px]">
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
                <ShieldCheck size={22} />
              </div>
              <p className="mt-4 font-black text-[var(--text)]">
                No trade receipts yet
              </p>
              <p className="mt-1 text-sm">
                Perform a swap to generate an IPFS receipt and on-chain anchor.
              </p>
            </div>
          </div>
        ) : (
          receipts.map((receipt, index) => {
            const key = receipt.txHash || receipt.evidenceSubject || index;

            return (
              <ReceiptCard
                key={`${key}-${receipt.createdAt || index}`}
                receipt={receipt}
                verifyResult={verifyResults[key]}
                onVerify={() => onVerifyReceipt(receipt)}
                onDownload={() => onDownloadReceipt(receipt)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/55 px-4 py-3">
      <div className="text-[11px] font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 text-xl font-black text-[var(--text)]">{value}</div>
    </div>
  );
}