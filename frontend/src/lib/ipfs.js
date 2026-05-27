import { ethers } from "ethers";
import { HARDHAT_CHAIN_ID, SYMBOLS } from "../config/contracts";
import { createWalletHash } from "./privacy";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs";
const ENABLE_LOCAL_FALLBACK =
  import.meta.env.VITE_ENABLE_LOCAL_IPFS_FALLBACK === "true";

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

export function getIPFSRuntimeStatus() {
  return {
    provider: PINATA_JWT ? "Pinata IPFS" : "Not configured",
    gateway: IPFS_GATEWAY,
    hasPinataJwt: Boolean(PINATA_JWT),
    localFallbackEnabled: ENABLE_LOCAL_FALLBACK,
    mode: PINATA_JWT
      ? "production-ipfs"
      : ENABLE_LOCAL_FALLBACK
        ? "local-demo"
        : "not-ready",
  };
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

export function normalizeCid(input) {
  const value = String(input || "").trim();

  if (!value) return "";

  if (value.startsWith("ipfs://")) {
    return value.replace("ipfs://", "").replace(/^ipfs\//, "");
  }

  if (value.includes("/ipfs/")) {
    return value.split("/ipfs/")[1].split("?")[0].split("#")[0];
  }

  return value;
}

export function evidenceURIFromCid(cid) {
  const normalizedCid = normalizeCid(cid);

  if (!normalizedCid) return "";
  if (normalizedCid.startsWith("local-")) return `local://${normalizedCid}`;

  return `ipfs://${normalizedCid}`;
}

export function getGatewayUrl(cid) {
  const normalizedCid = normalizeCid(cid);

  if (!normalizedCid || normalizedCid.startsWith("local-")) return "";

  return `${IPFS_GATEWAY.replace(/\/$/, "")}/${normalizedCid}`;
}

export async function uploadJsonToIPFS(content, name = "dexck-data.json") {
  if (!content || typeof content !== "object") {
    throw new Error("Only JSON objects can be uploaded to the evidence layer.");
  }

  if (!PINATA_JWT) {
    if (!ENABLE_LOCAL_FALLBACK) {
      throw new Error(
        "Pinata is not configured. Add VITE_PINATA_JWT to .env to upload real IPFS evidence."
      );
    }

    const cid = createLocalCid();
    const cache = readLocalCache();

    cache[cid] = {
      cid,
      name,
      content,
      createdAt: new Date().toISOString(),
      mode: "local-demo",
      warning:
        "This is local fallback only. It is not IPFS and must not be used for final demo.",
    };

    writeLocalCache(cache);

    return {
      cid,
      url: "",
      mode: "local-demo",
      provider: "localStorage",
    };
  }

  const response = await fetch(PINATA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name,
        keyvalues: {
          project: "DEXCK-AMM",
          course: "IS355",
          evidenceLayer: "IPFS",
          createdAt: new Date().toISOString(),
        },
      },
      pinataContent: content,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Upload to Pinata IPFS failed.");
  }

  const data = await response.json();

  if (!data.IpfsHash) {
    throw new Error("Pinata did not return an IPFS CID.");
  }

  return {
    cid: data.IpfsHash,
    url: getGatewayUrl(data.IpfsHash),
    mode: "production-ipfs",
    provider: "Pinata",
    pinSize: data.PinSize,
    timestamp: data.Timestamp,
  };
}

export async function retrieveJsonFromIPFS(cidOrUri) {
  const cid = normalizeCid(cidOrUri);

  if (!cid) {
    throw new Error("CID is required.");
  }

  if (cid.startsWith("local-")) {
    if (!ENABLE_LOCAL_FALLBACK) {
      throw new Error("Local fallback is disabled. Use a real IPFS CID.");
    }

    const cache = readLocalCache();
    const item = cache[cid];

    if (!item) {
      throw new Error("Local CID not found.");
    }

    return item.content;
  }

  const response = await fetch(getGatewayUrl(cid), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Cannot retrieve JSON from IPFS gateway.");
  }

  return response.json();
}

export function createTokenList({ tokenA, tokenB, amm, lpToken, rewardToken }) {
  return {
    type: "token-list",
    name: "DEXCK Token List",
    description:
      "Supported ERC-20 tokens and AMM pool metadata for DEXCK production-like demo.",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    chainId: HARDHAT_CHAIN_ID,
    amm,
    storage: {
      layer: "IPFS",
      provider: "Pinata",
      purpose:
        "Public token metadata for frontend rendering and independent audit.",
    },
    tokens: [
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "Demo Token A",
        symbol: SYMBOLS.tokenA,
        decimals: 18,
        address: tokenA,
        standard: "ERC-20",
        logoURI: "",
      },
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "Demo Token B",
        symbol: SYMBOLS.tokenB,
        decimals: 18,
        address: tokenB,
        standard: "ERC-20",
        logoURI: "",
      },
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "AMM LP Token",
        symbol: SYMBOLS.lpToken,
        decimals: 18,
        address: lpToken || "",
        standard: "ERC-20 LP Token",
        logoURI: "",
      },
      {
        chainId: HARDHAT_CHAIN_ID,
        name: "DEX Reward Token",
        symbol: SYMBOLS.rewardToken,
        decimals: 18,
        address: rewardToken || "",
        standard: "ERC-20 Reward Token",
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
    storage: {
      layer: "IPFS",
      provider: "Pinata",
      purpose:
        "Off-chain governance document. Hash/CID can be anchored on-chain for integrity.",
    },
    privacyNote:
      "Raw wallet address is not stored in this proposal metadata. Only wallet hash is stored.",
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
    storage: {
      layer: "IPFS",
      provider: "Pinata",
      purpose:
        "Human-readable trade receipt. Its content hash is anchored on-chain for verification.",
    },
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