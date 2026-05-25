import { useMemo, useState } from "react";
import { CheckCircle2, Database, FileJson } from "lucide-react";

import SurfaceCard from "../../components/common/SurfaceCard";
import { CONTRACTS, SYMBOLS } from "../../config/contracts";
import { getAMM } from "../../lib/contracts";
import {
  createGovernanceProposal,
  createTokenList,
  getTradeReceipts,
  retrieveJsonFromIPFS,
  uploadJsonToIPFS,
} from "../../lib/ipfs";

import CIDRetrieveCard from "./components/CIDRetrieveCard";
import GovernanceProposalCard from "./components/GovernanceProposalCard";
import IPFSActionCard from "./components/IPFSActionCard";
import JsonPreviewPanel from "./components/JsonPreviewPanel";
import TradeReceiptsPanel from "./components/TradeReceiptsPanel";

import { downloadJson } from "./utils/downloadJson";
import {
  evidenceTypeName,
  getRecordField,
  normalizeHash,
} from "./utils/evidenceFormat";

export default function IPFSPanelCard({ wallet }) {
  const walletAddress = wallet?.address;
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
  const [verifyResults, setVerifyResults] = useState({});

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

  async function handleVerifyReceipt(receipt) {
    const key = receipt.txHash || receipt.evidenceSubject;

    try {
      if (!wallet?.provider && !wallet?.signer) {
        throw new Error("Connect wallet to read on-chain evidence.");
      }

      const subject = receipt.evidenceSubject || receipt.txHash;
      const expectedHash =
        receipt.evidenceContentHash || receipt.receiptHash || receipt.contentHash;

      if (!subject) {
        throw new Error("Receipt does not contain evidence subject / tx hash.");
      }

      if (!expectedHash) {
        throw new Error("Receipt does not contain receipt hash.");
      }

      setVerifyResults((prev) => ({
        ...prev,
        [key]: {
          status: "checking",
          message: "Checking on-chain evidence...",
        },
      }));

      const amm = getAMM(wallet.signer || wallet.provider);
      const record = await amm.getEvidence(subject);

      const evidenceType = getRecordField(record, "evidenceType", 0);
      const onChainHash = getRecordField(record, "contentHash", 1);
      const evidenceURI = getRecordField(record, "evidenceURI", 2);
      const submitter = getRecordField(record, "submitter", 3);
      const submittedAt = getRecordField(record, "submittedAt", 4);

      if (!submittedAt || submittedAt === 0n) {
        throw new Error("No on-chain evidence found for this receipt.");
      }

      const hashMatched =
        normalizeHash(onChainHash) === normalizeHash(expectedHash);

      const uriMatched =
        !receipt.evidenceURI ||
        normalizeHash(evidenceURI) === normalizeHash(receipt.evidenceURI);

      if (!hashMatched) {
        setVerifyResults((prev) => ({
          ...prev,
          [key]: {
            status: "mismatch",
            message: "Receipt hash does not match on-chain evidence.",
            onChainHash,
            expectedHash,
            evidenceURI,
            submitter,
            evidenceType: evidenceTypeName(evidenceType),
          },
        }));
        return;
      }

      setVerifyResults((prev) => ({
        ...prev,
        [key]: {
          status: uriMatched ? "verified" : "warning",
          message: uriMatched
            ? "Verified. Receipt hash matches on-chain evidence."
            : "Hash verified, but evidence URI differs from local receipt.",
          onChainHash,
          expectedHash,
          evidenceURI,
          submitter,
          evidenceType: evidenceTypeName(evidenceType),
        },
      }));
    } catch (error) {
      console.error(error);
      setVerifyResults((prev) => ({
        ...prev,
        [key]: {
          status: "failed",
          message: error.message || "Verification failed.",
        },
      }));
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
              off-chain. Anchored receipts can be verified against on-chain
              content hashes.
            </p>
          </div>
        </div>

        {status ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-2 text-xs font-black text-[var(--success)]">
            <CheckCircle2 size={15} />
            {status}
          </div>
        ) : (
          <div className="dex-chip dex-chip-success">Evidence Ready</div>
        )}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <div className="grid gap-5 xl:col-span-5">
          <IPFSActionCard
            icon={<FileJson size={18} />}
            title="Token List JSON"
            tag="Metadata"
            description={`Upload supported token metadata for ${SYMBOLS.tokenA}, ${SYMBOLS.tokenB}, ${SYMBOLS.lpToken}, reward token, and AMM pair information.`}
            buttonText="Upload Token List"
            onClick={handleUploadTokenList}
          />

          <GovernanceProposalCard
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
          <TradeReceiptsPanel
            receipts={receipts}
            verifyResults={verifyResults}
            onVerifyReceipt={handleVerifyReceipt}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
            onDownloadAll={handleDownloadAllReceipts}
            onDownloadReceipt={handleDownloadReceipt}
          />

          <CIDRetrieveCard
            cid={cid}
            setCid={setCid}
            onRetrieve={handleRetrieve}
          />
        </div>
      </div>

      <JsonPreviewPanel lastUpload={lastUpload} retrievedJson={retrievedJson} />
    </SurfaceCard>
  );
}