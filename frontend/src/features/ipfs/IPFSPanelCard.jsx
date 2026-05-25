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

import Button from "../../components/common/Button";
import SurfaceCard from "../../components/common/SurfaceCard";
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
    <SurfaceCard variant="panel" className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--blue-soft)] text-[var(--blue)]">
            <Database size={22} />
          </div>

          <div>
            <div className="dex-chip">Off-chain Evidence Layer</div>
            <h2 className="mt-3 text-2xl font-black text-[var(--text)]">
              IPFS Evidence Center
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Store token lists, governance proposals, and trade receipts
              off-chain while keeping the AMM flow lightweight and auditable.
            </p>
          </div>
        </div>

        {status ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-2 text-xs font-black text-[var(--success)]">
            <CheckCircle2 size={15} />
            {status}
          </div>
        ) : (
          <div className="dex-chip dex-chip-success">IPFS Ready</div>
        )}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <div className="grid gap-5 xl:col-span-5">
          <ActionCard
            icon={<FileJson size={18} />}
            title="Token List JSON"
            tag="Metadata"
            description={`Upload supported token metadata for ${SYMBOLS.tokenA}, ${SYMBOLS.tokenB}, ${SYMBOLS.lpToken}, reward token, and AMM pair information.`}
            buttonText="Upload Token List"
            onClick={handleUploadTokenList}
          />

          <GovernanceCard
            proposalTitle={proposalTitle}
            setProposalTitle={setProposalTitle}
            proposalDescription={proposalDescription}
            setProposalDescription={setProposalDescription}
            proposedFeeBps={proposedFeeBps}
            setProposedFeeBps={setProposedFeeBps}
            onUpload={handleUploadProposal}
          />
        </div>

        <div className="grid gap-5 xl:col-span-7">
          <TradeReceiptsCard
            receipts={receipts}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
            onDownloadAll={handleDownloadAllReceipts}
            onDownloadReceipt={handleDownloadReceipt}
          />

          <RetrieveCard
            cid={cid}
            setCid={setCid}
            onRetrieve={handleRetrieve}
          />
        </div>
      </div>

      {lastUpload ? (
        <section className="mt-5 rounded-3xl border border-[var(--primary-border)] bg-[var(--primary-soft)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="dex-chip">Last Upload</div>
              <p className="mt-3 text-lg font-black text-[var(--text)]">
                {lastUpload.type}
              </p>
              <p className="mt-1 break-all text-sm text-[var(--muted)]">
                CID: {lastUpload.cid}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => copyText(lastUpload.cid)}>
                <Copy size={15} />
                Copy CID
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  downloadJson(
                    lastUpload.content,
                    `${lastUpload.type.toLowerCase().replaceAll(" ", "-")}.json`
                  )
                }
              >
                <Download size={15} />
                Download JSON
              </Button>

              {lastUpload.url ? (
                <a
                  href={lastUpload.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-black text-[var(--text)] transition hover:-translate-y-0.5"
                >
                  <ExternalLink size={15} />
                  Open Gateway
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {retrievedJson ? (
        <section className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-[var(--text)]">
              Retrieved JSON
            </h3>

            <Button
              variant="ghost"
              onClick={() => downloadJson(retrievedJson, "retrieved-ipfs-json.json")}
            >
              <Download size={15} />
              Download
            </Button>
          </div>

          <pre className="scroll-panel max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {JSON.stringify(retrievedJson, null, 2)}
          </pre>
        </section>
      ) : null}
    </SurfaceCard>
  );
}

function ActionCard({ icon, title, tag, description, buttonText, onClick }) {
  return (
    <section className="dex-panel p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          {icon}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--text)]">{title}</h3>
            <span className="dex-chip">{tag}</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>

      <Button className="mt-5 w-full" onClick={onClick}>
        <UploadCloud size={16} />
        {buttonText}
      </Button>
    </section>
  );
}

function GovernanceCard({
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

function RetrieveCard({ cid, setCid, onRetrieve }) {
  return (
    <section className="dex-panel p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--blue-soft)] text-[var(--blue)]">
          <Search size={18} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--text)]">Retrieve by CID</h3>
            <span className="dex-chip">Lookup</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Paste an IPFS or local CID to verify the original JSON document.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={cid}
          onChange={(event) => setCid(event.target.value)}
          className="input-shell px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
          placeholder="Paste CID here"
        />

        <Button onClick={onRetrieve}>
          <Search size={16} />
          Retrieve
        </Button>
      </div>
    </section>
  );
}

function TradeReceiptsCard({
  receipts,
  onRefresh,
  onDownloadAll,
  onDownloadReceipt,
}) {
  return (
    <section className="dex-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="dex-chip">Receipts</div>
          <h3 className="mt-3 text-xl font-black text-[var(--text)]">
            Trade Receipts
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Receipts are generated after swaps and can be downloaded for
            reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onRefresh}>
            <RefreshCcw size={15} />
            Refresh
          </Button>

          <Button
            onClick={onDownloadAll}
            disabled={receipts.length === 0}
          >
            <Download size={15} />
            Download All
          </Button>
        </div>
      </div>

      <div className="scroll-panel mt-4 grid max-h-[430px] gap-3 overflow-auto pr-2">
        {receipts.length === 0 ? (
          <div className="empty-state">
            <div>
              <p className="font-black text-[var(--text)]">
                No trade receipts yet
              </p>
              <p className="mt-1 text-sm">
                Perform a swap to generate one.
              </p>
            </div>
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <ReceiptRow
              key={`${receipt.txHash || index}-${receipt.createdAt || index}`}
              receipt={receipt}
              onDownload={() => onDownloadReceipt(receipt)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ReceiptRow({ receipt, onDownload }) {
  const gatewayUrl = getGatewayUrl(receipt.cid);

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="dex-chip dex-chip-success">Trade Receipt</span>
            <span className="dex-chip">{receipt.ipfsMode || "local"}</span>
          </div>

          <p className="mt-3 text-base font-black text-[var(--text)]">
            {receipt.amountIn} {receipt.tokenIn} →{" "}
            <span className="market-up">
              {receipt.amountOut || receipt.minAmountOut} {receipt.tokenOut}
            </span>
          </p>

          <p className="mt-1 break-all text-xs text-[var(--muted)]">
            Tx: {receipt.txHash || "N/A"}
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            CID: {shortCid(receipt.cid)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {receipt.cid ? (
            <Button variant="ghost" onClick={() => copyText(receipt.cid)}>
              <Copy size={15} />
              Copy CID
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
    </article>
  );
}