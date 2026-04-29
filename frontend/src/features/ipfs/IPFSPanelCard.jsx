import { useEffect, useState } from "react";
import { FileText, RefreshCw, Search, UploadCloud, Vote } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";
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

    const [proposalTitle, setProposalTitle] = useState(
        "Change trading fee to 0.5%"
    );
    const [proposalDescription, setProposalDescription] = useState(
        "Community proposal to increase swap fee for liquidity providers."
    );
    const [proposedFeeBps, setProposedFeeBps] = useState("50");

    useEffect(() => {
        setReceipts(getTradeReceipts());
    }, []);

    async function handleUploadTokenList() {
        try {
            setStatus("Uploading token list...");

            const tokenList = createTokenList({
                tokenA: CONTRACTS.tokenA,
                tokenB: CONTRACTS.tokenB,
                amm: CONTRACTS.amm,
            });

            const result = await uploadJsonToIPFS(
                tokenList,
                "dexck-token-list.json"
            );

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

            const result = await uploadJsonToIPFS(
                proposal,
                "dexck-governance-proposal.json"
            );

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
        <SurfaceCard className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                    <IconBadge tone="soft" className="h-11 w-11">
                        <UploadCloud size={20} />
                    </IconBadge>

                    <div>
                        <h3 className="text-[18px] font-bold text-[var(--text)]">
                            Off-chain IPFS Storage
                        </h3>
                        <p className="text-sm text-[var(--muted)]">
                            Token metadata, trade receipts, and governance documents
                        </p>
                    </div>
                </div>

                <div className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-600 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
                    IPFS
                </div>
            </div>

            {status ? (
                <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)]">
                    {status}
                </div>
            ) : null}

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
                <div className="grid gap-5">
                    <PanelSection
                        icon={<FileText size={18} />}
                        title="1. Token List JSON"
                        description="Upload supported token metadata: TKA, TKB, contract addresses, and AMM pair information."
                    >
                        <button
                            type="button"
                            onClick={handleUploadTokenList}
                            className="rounded-[14px] bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Upload Token List
                        </button>

                        {tokenListCid ? <CIDBox cid={tokenListCid} /> : null}
                    </PanelSection>

                    <PanelSection
                        icon={<Vote size={18} />}
                        title="2. Governance Proposal"
                        description="Store fee-change proposals or AMM governance documents on IPFS."
                    >
                        <div className="grid gap-3">
                            <input
                                value={proposalTitle}
                                onChange={(event) => setProposalTitle(event.target.value)}
                                className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                                placeholder="Proposal title"
                            />

                            <textarea
                                value={proposalDescription}
                                onChange={(event) =>
                                    setProposalDescription(event.target.value)
                                }
                                className="min-h-[90px] rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                                placeholder="Proposal description"
                            />

                            <input
                                value={proposedFeeBps}
                                onChange={(event) => setProposedFeeBps(event.target.value)}
                                className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                                placeholder="Proposed fee bps, e.g. 50 = 0.5%"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleUploadProposal}
                            className="mt-4 rounded-[14px] bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Upload Proposal
                        </button>

                        {proposalCid ? <CIDBox cid={proposalCid} /> : null}
                    </PanelSection>
                </div>

                <div className="grid gap-5">
                    <PanelSection
                        icon={<RefreshCw size={18} />}
                        title="3. Trade Receipts"
                        description="Receipts are generated after successful swaps."
                        action={
                            <button
                                type="button"
                                onClick={refreshReceipts}
                                className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text)]"
                            >
                                Refresh
                            </button>
                        }
                    >
                        <div className="grid max-h-[360px] gap-3 overflow-auto pr-1">
                            {receipts.length === 0 ? (
                                <EmptyState text="No receipts yet. Make a swap first." />
                            ) : (
                                receipts.map((receipt) => (
                                    <ReceiptItem
                                        key={`${receipt.txHash}-${receipt.createdAt}`}
                                        receipt={receipt}
                                    />
                                ))
                            )}
                        </div>
                    </PanelSection>

                    <PanelSection
                        icon={<Search size={18} />}
                        title="4. Retrieve by CID"
                        description="Paste a CID to load JSON from IPFS or local demo storage."
                    >
                        <div className="flex flex-col gap-3 md:flex-row">
                            <input
                                value={retrieveCid}
                                onChange={(event) => setRetrieveCid(event.target.value)}
                                className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                                placeholder="Paste CID here"
                            />

                            <button
                                type="button"
                                onClick={handleRetrieve}
                                className="rounded-[14px] bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
                            >
                                Retrieve
                            </button>
                        </div>

                        {retrievedJson ? (
                            <pre className="mt-4 max-h-[300px] overflow-auto rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--text)]">
                                {retrievedJson}
                            </pre>
                        ) : null}
                    </PanelSection>
                </div>
            </div>
        </SurfaceCard>
    );
}

function PanelSection({ icon, title, description, action, children }) {
    return (
        <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-teal-500">{icon}</div>

                    <div>
                        <h4 className="font-bold text-[var(--text)]">{title}</h4>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                            {description}
                        </p>
                    </div>
                </div>

                {action}
            </div>

            <div className="mt-4">{children}</div>
        </section>
    );
}

function ReceiptItem({ receipt }) {
    return (
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-[var(--text)]">
                    {receipt.tokenIn} → {receipt.tokenOut}
                </span>
                <span className="text-[var(--muted)]">Block #{receipt.blockNumber}</span>
            </div>

            <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Amount in: {receipt.amountIn} {receipt.tokenIn}
                <br />
                Minimum out: {receipt.minAmountOut} {receipt.tokenOut}
                <br />
                CID: {receipt.cid || "upload failed / not available"}
            </div>

            {receipt.cid ? <CIDBox cid={receipt.cid} compact /> : null}
        </div>
    );
}

function CIDBox({ cid, compact = false }) {
    const gatewayUrl = getGatewayUrl(cid);

    return (
        <div
            className={`mt-3 rounded-[14px] border border-teal-200 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300 ${compact ? "text-[11px]" : ""
                }`}
        >
            <div className="font-bold">CID</div>
            <div className="break-all">{cid}</div>

            {gatewayUrl ? (
                <a
                    href={gatewayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-semibold underline"
                >
                    Open IPFS Gateway
                </a>
            ) : (
                <div className="mt-2">
                    Local demo CID. Add VITE_PINATA_JWT to upload to real IPFS.
                </div>
            )}
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            {text}
        </div>
    );
}