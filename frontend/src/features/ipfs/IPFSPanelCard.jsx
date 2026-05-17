import { useEffect, useState } from "react";
import { DatabaseZap, FileText, RefreshCw, Search, UploadCloud, Vote } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";
import Button from "../../components/common/Button";
import { CONTRACTS } from "../../config/contracts";
import {
  createGovernanceProposal,
  createTokenList,
  getGatewayUrl,
  getTradeReceipts,
  retrieveJsonFromIPFS,
  uploadJsonToIPFS,
} from "../../lib/ipfs";

export default function IPFSPanelCard({ walletAddress }) {
  const [status, setStatus] = useState("");
  const [tokenListCid, setTokenListCid] = useState("");
  const [proposalCid, setProposalCid] = useState("");
  const [retrieveCid, setRetrieveCid] = useState("");
  const [retrievedJson, setRetrievedJson] = useState("");
  const [receipts, setReceipts] = useState([]);

  const [proposalTitle, setProposalTitle] = useState("Change trading fee to 0.5%");
  const [proposalDescription, setProposalDescription] = useState(
    "Community proposal to increase swap fee for liquidity providers."
  );
  const [proposedFeeBps, setProposedFeeBps] = useState("50");

  useEffect(() => {
    setReceipts(getTradeReceipts());
  }, []);

  async function handleUploadTokenList() {
    try {
      setStatus("Uploading token list to IPFS...");
      const tokenList = createTokenList({
        tokenA: CONTRACTS.tokenA,
        tokenB: CONTRACTS.tokenB,
        amm: CONTRACTS.amm,
        lpToken: CONTRACTS.lpToken,
        rewardToken: CONTRACTS.rewardToken,
      });
      const result = await uploadJsonToIPFS(tokenList, "dexck-token-list.json");
      setTokenListCid(result.cid);
      setStatus(`Token list uploaded: ${result.cid}`);
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
        proposedFeeBps: Number(proposedFeeBps),
        proposer: walletAddress || "not-connected",
      });
      const result = await uploadJsonToIPFS(proposal, "dexck-governance-proposal.json");
      setProposalCid(result.cid);
      setStatus(`Proposal uploaded: ${result.cid}`);
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload proposal failed.");
    }
  }

  async function handleRetrieve() {
    try {
      setStatus("Retrieving JSON from IPFS...");
      const json = await retrieveJsonFromIPFS(retrieveCid);
      setRetrievedJson(JSON.stringify(json, null, 2));
      setStatus("Retrieve successful.");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Retrieve failed.");
    }
  }

  function refreshReceipts() {
    setReceipts(getTradeReceipts());
  }

  return (
    <SurfaceCard className="p-6" hover>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <IconBadge tone="blue" className="h-12 w-12">
            <DatabaseZap size={22} />
          </IconBadge>

          <div>
            <div className="inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-black text-[var(--accent)]">
              Off-chain storage layer
            </div>
            <h3 className="mt-3 text-2xl font-black text-[var(--text)]">
              IPFS Evidence Center
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Store token lists, trade receipts, and governance proposals off-chain while keeping the AMM flow light and gas-efficient.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
          IPFS Ready
        </div>
      </div>

      {status ? (
        <div className="mt-5 rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary-dark)]">
          {status}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="grid gap-5">
          <PanelSection
            icon={<FileText size={18} />}
            title="Token List JSON"
            badge="metadata"
            description="Upload supported token metadata, contract addresses, LP token, reward token, and AMM pair information."
          >
            <Button type="button" onClick={handleUploadTokenList}>
              <UploadCloud size={16} />
              Upload Token List
            </Button>
            {tokenListCid ? <CIDBox cid={tokenListCid} /> : null}
          </PanelSection>

          <PanelSection
            icon={<Vote size={18} />}
            title="Governance Proposal"
            badge="proposal"
            description="Store fee-change proposals or AMM governance documents on IPFS."
          >
            <div className="grid gap-3">
              <input
                value={proposalTitle}
                onChange={(event) => setProposalTitle(event.target.value)}
                className="input-shell rounded-2xl px-4 py-3 text-sm"
                placeholder="Proposal title"
              />
              <textarea
                value={proposalDescription}
                onChange={(event) => setProposalDescription(event.target.value)}
                className="input-shell min-h-[96px] rounded-2xl px-4 py-3 text-sm"
                placeholder="Proposal description"
              />
              <input
                value={proposedFeeBps}
                onChange={(event) => setProposedFeeBps(event.target.value)}
                className="input-shell rounded-2xl px-4 py-3 text-sm"
                placeholder="Proposed fee bps, e.g. 50 = 0.5%"
              />
            </div>
            <Button type="button" onClick={handleUploadProposal} className="mt-4">
              <UploadCloud size={16} />
              Upload Proposal
            </Button>
            {proposalCid ? <CIDBox cid={proposalCid} /> : null}
          </PanelSection>
        </div>

        <div className="grid gap-5">
          <PanelSection
            icon={<RefreshCw size={18} />}
            title="Trade Receipts"
            badge="receipts"
            description="Receipts are generated after successful swaps and saved locally or uploaded to IPFS."
            action={
              <Button type="button" variant="ghost" size="sm" onClick={refreshReceipts}>
                <RefreshCw size={14} />
                Refresh
              </Button>
            }
          >
            <div className="grid max-h-[365px] gap-3 overflow-auto pr-1">
              {receipts.length === 0 ? (
                <EmptyState text="No receipts yet. Make a swap first." />
              ) : (
                receipts.map((receipt) => (
                  <ReceiptItem key={`${receipt.txHash}-${receipt.createdAt}`} receipt={receipt} />
                ))
              )}
            </div>
          </PanelSection>

          <PanelSection
            icon={<Search size={18} />}
            title="Retrieve by CID"
            badge="lookup"
            description="Paste a CID to load JSON from IPFS or local demo storage."
          >
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={retrieveCid}
                onChange={(event) => setRetrieveCid(event.target.value)}
                className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
                placeholder="Paste CID here"
              />
              <Button type="button" onClick={handleRetrieve}>
                Retrieve
              </Button>
            </div>

            {retrievedJson ? (
              <pre className="mt-4 max-h-[300px] overflow-auto rounded-2xl border border-[var(--border)] bg-slate-950 p-4 text-xs leading-5 text-teal-100">
                {retrievedJson}
              </pre>
            ) : null}
          </PanelSection>
        </div>
      </div>
    </SurfaceCard>
  );
}

function PanelSection({ icon, title, description, badge, action, children }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
            {icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-black text-[var(--text)]">{title}</h4>
              {badge ? (
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--accent)]">
                  {badge}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ReceiptItem({ receipt }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-black text-[var(--text)]">
          {receipt.tokenIn} → {receipt.tokenOut}
        </span>
        <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary-dark)]">
          Block #{receipt.blockNumber}
        </span>
      </div>
      <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
        Amount in: {receipt.amountIn} {receipt.tokenIn}<br />
        Minimum out: {receipt.minAmountOut} {receipt.tokenOut}<br />
        CID: {receipt.cid || "upload failed / not available"}
      </div>
      {receipt.cid ? <CIDBox cid={receipt.cid} compact /> : null}
    </div>
  );
}

function CIDBox({ cid, compact = false }) {
  const gatewayUrl = getGatewayUrl(cid);

  return (
    <div className={`mt-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300 ${compact ? "text-[11px]" : ""}`}>
      <div className="font-black">CID</div>
      <div className="break-all">{cid}</div>
      {gatewayUrl ? (
        <a href={gatewayUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-black underline">
          Open IPFS Gateway
        </a>
      ) : (
        <div className="mt-2">Local demo CID. Add VITE_PINATA_JWT to upload to real IPFS.</div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-center text-sm text-[var(--muted)]">
      {text}
    </div>
  );
}
