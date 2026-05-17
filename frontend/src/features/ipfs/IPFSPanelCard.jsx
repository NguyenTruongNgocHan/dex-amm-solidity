import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  RefreshCcw,
  Search,
  UploadCloud,
} from "lucide-react";

import { CONTRACTS, SYMBOLS } from "../../config/contracts";
import {
  createGovernanceProposal,
  createTokenList,
  getGatewayUrl,
  getTradeReceipts,
  retrieveJsonFromIPFS,
  uploadJsonToIPFS,
} from "../../lib/ipfs";

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function copyText(value) {
  navigator.clipboard?.writeText(value);
}

function shortCid(cid) {
  if (!cid) return "local only";
  if (cid.length <= 18) return cid;
  return `${cid.slice(0, 10)}...${cid.slice(-8)}`;
}

export default function IPFSPanelCard({ walletAddress }) {
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");
  const [retrievedJson, setRetrievedJson] = useState(null);
  const [lastUpload, setLastUpload] = useState(null);
  const [proposalTitle, setProposalTitle] = useState("Reduce AMM swap fee");
  const [proposalDescription, setProposalDescription] = useState(
    "Proposal to reduce swap fee to improve trading volume while keeping LP incentives."
  );
  const [proposedFeeBps, setProposedFeeBps] = useState("25");
  const [refreshKey, setRefreshKey] = useState(0);

  const receipts = useMemo(() => {
    refreshKey;
    return getTradeReceipts();
  }, [refreshKey]);

  async function handleUploadTokenList() {
    try {
      setStatus("Uploading token list...");

      const tokenList = createTokenList({
        tokenA: CONTRACTS.tokenA,
        tokenB: CONTRACTS.tokenB,
        amm: CONTRACTS.amm,
        lpToken: CONTRACTS.lpToken,
        rewardToken: CONTRACTS.rewardToken,
      });

      const upload = await uploadJsonToIPFS(tokenList, "dexck-token-list.json");

      setLastUpload({
        type: "Token List",
        cid: upload.cid,
        url: upload.url,
        mode: upload.mode,
        content: tokenList,
      });

      setStatus("Token list uploaded.");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload token list failed.");
    }
  }

  async function handleUploadProposal() {
    try {
      setStatus("Uploading governance proposal...");

      const proposal = createGovernanceProposal({
        title: proposalTitle,
        description: proposalDescription,
        proposedFeeBps,
        proposer: walletAddress || "guest",
      });

      const upload = await uploadJsonToIPFS(
        proposal,
        "dexck-governance-proposal.json"
      );

      setLastUpload({
        type: "Governance Proposal",
        cid: upload.cid,
        url: upload.url,
        mode: upload.mode,
        content: proposal,
      });

      setStatus("Governance proposal uploaded.");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload proposal failed.");
    }
  }

  async function handleRetrieve() {
    try {
      setStatus("Retrieving JSON from IPFS...");
      const json = await retrieveJsonFromIPFS(cid.trim());

      setRetrievedJson(json);
      setStatus("CID retrieved successfully.");
    } catch (error) {
      console.error(error);
      setRetrievedJson(null);
      setStatus(error.message || "Retrieve failed.");
    }
  }

  function handleDownloadReceipt(receipt) {
    const filename = `trade-receipt-${receipt.txHash || Date.now()}.json`;
    downloadJson(receipt, filename);
  }

  function handleDownloadAllReceipts() {
    downloadJson(receipts, "dexck-trade-receipts.json");
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Database size={20} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[var(--text)]">
                IPFS Evidence Center
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Store and retrieve token lists, trade receipts, and governance
                documents.
              </p>
            </div>
          </div>
        </div>

        {status ? (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--text)]">
            <CheckCircle2 size={16} className="text-[var(--primary)]" />
            {status}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <ActionCard
          icon={<FileJson size={18} />}
          title="Token List"
          description={`Upload metadata for ${SYMBOLS.tokenA}, ${SYMBOLS.tokenB}, ${SYMBOLS.lpToken}, ${SYMBOLS.rewardToken}, and contract addresses.`}
          buttonText="Upload Token List"
          onClick={handleUploadTokenList}
        />

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <FileText size={18} />
            </div>

            <div>
              <h3 className="font-black text-[var(--text)]">
                Governance Proposal
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Upload fee-change proposal documents for off-chain governance
                evidence.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={proposalTitle}
              onChange={(event) => setProposalTitle(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
              placeholder="Proposal title"
            />

            <textarea
              value={proposalDescription}
              onChange={(event) => setProposalDescription(event.target.value)}
              className="min-h-[96px] resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
              placeholder="Proposal description"
            />

            <input
              value={proposedFeeBps}
              onChange={(event) => setProposedFeeBps(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
              placeholder="Proposed fee bps"
            />

            <button
              onClick={handleUploadProposal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90"
            >
              <UploadCloud size={16} />
              Upload Proposal
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Search size={18} />
            </div>

            <div>
              <h3 className="font-black text-[var(--text)]">
                Retrieve by CID
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Paste an IPFS/local CID to retrieve the original JSON document.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={cid}
              onChange={(event) => setCid(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
              placeholder="ipfs CID or local-* CID"
            />

            <button
              onClick={handleRetrieve}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90"
            >
              <Search size={16} />
              Retrieve JSON
            </button>
          </div>
        </section>
      </div>

      {lastUpload ? (
        <section className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-[var(--muted)]">
                Last Upload
              </h3>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                {lastUpload.type}
              </p>
              <p className="mt-1 break-all text-sm text-[var(--muted)]">
                CID: {lastUpload.cid}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyText(lastUpload.cid)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)]"
              >
                <Copy size={15} />
                Copy CID
              </button>

              <button
                onClick={() =>
                  downloadJson(
                    lastUpload.content,
                    `${lastUpload.type.toLowerCase().replaceAll(" ", "-")}.json`
                  )
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)]"
              >
                <Download size={15} />
                Download JSON
              </button>

              {lastUpload.url ? (
                <a
                  href={lastUpload.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)]"
                >
                  <ExternalLink size={15} />
                  Open Gateway
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black text-[var(--text)]">
              Trade Receipts
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Receipts are generated after swaps and can be downloaded for
              reconciliation.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)]"
            >
              <RefreshCcw size={15} />
              Refresh
            </button>

            <button
              onClick={handleDownloadAllReceipts}
              disabled={receipts.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={15} />
              Download All
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {receipts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
              No trade receipts yet. Perform a swap to generate one.
            </div>
          ) : (
            receipts.map((receipt, index) => (
              <ReceiptRow
                key={`${receipt.txHash || index}-${receipt.createdAt || index}`}
                receipt={receipt}
                onDownload={() => handleDownloadReceipt(receipt)}
              />
            ))
          )}
        </div>
      </section>

      {retrievedJson ? (
        <section className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-[var(--text)]">
              Retrieved JSON
            </h3>

            <button
              onClick={() => downloadJson(retrievedJson, "retrieved-ipfs-json.json")}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]"
            >
              <Download size={15} />
              Download
            </button>
          </div>

          <pre className="custom-scrollbar max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {JSON.stringify(retrievedJson, null, 2)}
          </pre>
        </section>
      ) : null}
    </section>
  );
}

function ActionCard({ icon, title, description, buttonText, onClick }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          {icon}
        </div>

        <div>
          <h3 className="font-black text-[var(--text)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onClick}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90"
      >
        <UploadCloud size={16} />
        {buttonText}
      </button>
    </section>
  );
}

function ReceiptRow({ receipt, onDownload }) {
  const gatewayUrl = getGatewayUrl(receipt.cid);

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--primary)]">
              Trade Receipt
            </span>

            <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">
              {receipt.ipfsMode || "local"}
            </span>
          </div>

          <p className="mt-2 text-sm font-black text-[var(--text)]">
            {receipt.amountIn} {receipt.tokenIn} →{" "}
            {receipt.amountOut || receipt.minAmountOut} {receipt.tokenOut}
          </p>

          <p className="mt-1 break-all text-xs text-[var(--muted)]">
            Tx: {receipt.txHash || "N/A"}
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            CID: {shortCid(receipt.cid)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {receipt.cid ? (
            <button
              onClick={() => copyText(receipt.cid)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--text)]"
            >
              <Copy size={15} />
              Copy CID
            </button>
          ) : null}

          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--text)]"
          >
            <Download size={15} />
            Download JSON
          </button>

          {gatewayUrl ? (
            <a
              href={gatewayUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--text)]"
            >
              <ExternalLink size={15} />
              Open IPFS
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}