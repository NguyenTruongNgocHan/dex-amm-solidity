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

export function createTokenList({ tokenA, tokenB, amm }) {
  return {
    name: "DEXCK Token List",
    description: "Supported tokens for DEXCK AMM demo",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    amm,
    tokens: [
      {
        chainId: 31337,
        name: "Token A",
        symbol: "TKA",
        decimals: 18,
        address: tokenA,
        logoURI: "",
      },
      {
        chainId: 31337,
        name: "Token B",
        symbol: "TKB",
        decimals: 18,
        address: tokenB,
        logoURI: "",
      },
    ],
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
    proposer,
    createdAt: new Date().toISOString(),
    note: "This proposal is stored on IPFS as off-chain governance documentation.",
  };
}

export function createTradeReceipt({
  txHash,
  trader,
  direction,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
  blockNumber,
}) {
  return {
    type: "trade-receipt",
    project: "DEXCK AMM",
    txHash,
    trader,
    direction,
    tokenIn,
    tokenOut,
    amountIn,
    minAmountOut,
    blockNumber,
    createdAt: new Date().toISOString(),
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