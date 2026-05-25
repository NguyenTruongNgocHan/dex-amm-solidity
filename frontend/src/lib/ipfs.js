import { ethers } from "ethers";
import { HARDHAT_CHAIN_ID, SYMBOLS } from "../config/contracts";
import { createWalletHash } from "./privacy";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const LOCAL_IPFS_KEY = "dexck-local-ipfs-cache";
const TRADE_RECEIPTS_KEY = "dexck-trade-receipts";

function readLocalCache() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_IPFS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalCache(cache) {
  localStorage.setItem(LOCAL_IPFS_KEY, JSON.stringify(cache));
}

function createLocalCid() {
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function canonicalStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`)
    .join(",")}}`;
}

export function hashJsonContent(content) {
  return ethers.keccak256(ethers.toUtf8Bytes(canonicalStringify(content)));
}

export function subjectFromTxHash(txHash) {
  if (!txHash || !ethers.isHexString(txHash, 32)) {
    throw new Error("Invalid transaction hash for evidence subject.");
  }

  return txHash;
}

export function evidenceURIFromCid(cid) {
  if (!cid) return "";
  if (cid.startsWith("local-")) return `local://${cid}`;
  return `ipfs://${cid}`;
}

export function getGatewayUrl(cid) {
  if (!cid) return "";
  if (cid.startsWith("local-")) return "";
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export async function uploadJsonToIPFS(content, name = "dexck-data.json") {
  if (!PINATA_JWT) {
    const cid = createLocalCid();
    const cache = readLocalCache();

    cache[cid] = {
      cid,
      name,
      content,
      createdAt: new Date().toISOString(),
      mode: "local-demo",
      note: "Local fallback is used when VITE_PINATA_JWT is not configured. Production mode should use Pinata/IPFS gateway.",
    };

    writeLocalCache(cache);

    return {
      cid,
      url: "",
      mode: "local-demo",
    };
  }

  const response = await fetch(PINATA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataMetadata: {
        name,
      },
      pinataContent: content,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Upload to IPFS failed.");
  }

  const data = await response.json();

  return {
    cid: data.IpfsHash,
    url: getGatewayUrl(data.IpfsHash),
    mode: "pinata",
  };
}

export async function retrieveJsonFromIPFS(cid) {
  if (!cid) {
    throw new Error("CID is required.");
  }

  if (cid.startsWith("local-")) {
    const cache = readLocalCache();
    const item = cache[cid];

    if (!item) {
      throw new Error("Local CID not found.");
    }

    return item.content;
  }

  const response = await fetch(getGatewayUrl(cid));

  if (!response.ok) {
    throw new Error("Cannot retrieve JSON from IPFS gateway.");
  }

  return response.json();
}

export function createTokenList({ tokenA, tokenB, amm, lpToken, rewardToken }) {
  return {
    name: "DEXCK Token List",
    description: "Supported tokens for DEXCK AMM production-like demo",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    chainId: HARDHAT_CHAIN_ID,
    amm,
    tokens: [
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "Demo Token A",
        symbol: SYMBOLS.tokenA,
        decimals: 18,
        address: tokenA,
        logoURI: "",
      },
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "Demo Token B",
        symbol: SYMBOLS.tokenB,
        decimals: 18,
        address: tokenB,
        logoURI: "",
      },
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "AMM LP Token",
        symbol: SYMBOLS.lpToken,
        decimals: 18,
        address: lpToken || "",
        logoURI: "",
      },
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "DEX Reward Token",
        symbol: SYMBOLS.rewardToken,
        decimals: 18,
        address: rewardToken || "",
        logoURI: "",
      },
    ].filter((token) => token.address),
  };
}

export function createGovernanceProposal({
  title,
  description,
  proposedFeeBps,
  proposer,
}) {
  return {
    type: "governance-proposal",
    project: "DEXCK AMM",
    title,
    description,
    proposedFeeBps,
    proposerHash: createWalletHash(proposer),
    createdAt: new Date().toISOString(),
    note: "This proposal is stored on IPFS as off-chain governance documentation. Raw wallet address is not stored in this metadata.",
  };
}

export function createTradeReceipt({
  txHash,
  trader,
  direction,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  minAmountOut,
  blockNumber,
  contractAddress,
  slippageTolerance,
  priceImpact,
  fee,
}) {
  const baseReceipt = {
    type: "trade-receipt",
    project: "DEXCK AMM",
    chainId: HARDHAT_CHAIN_ID,
    txHash,
    blockNumber,
    walletHash: createWalletHash(trader),
    direction,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    minimumReceived: minAmountOut,
    slippageTolerance,
    priceImpact,
    fee,
    contractAddress,
    createdAt: new Date().toISOString(),
    privacyNote:
      "Raw wallet address is intentionally not stored in IPFS receipt. On-chain address remains public by Ethereum design; off-chain evidence stores only walletHash.",
  };

  return {
    ...baseReceipt,
    receiptHash: hashJsonContent(baseReceipt),
  };
}

export function saveTradeReceipt(receipt) {
  const receipts = getTradeReceipts();
  const next = [receipt, ...receipts].slice(0, 20);
  localStorage.setItem(TRADE_RECEIPTS_KEY, JSON.stringify(next));
  return next;
}

export function getTradeReceipts() {
  try {
    return JSON.parse(localStorage.getItem(TRADE_RECEIPTS_KEY) || "[]");
  } catch {
    return [];
  }
}