export function shortCid(cid) {
  if (!cid) return "Local only";
  if (cid.length <= 18) return cid;
  return `${cid.slice(0, 10)}...${cid.slice(-8)}`;
}

export function shortHash(hash) {
  if (!hash) return "N/A";
  if (hash.length <= 22) return hash;
  return `${hash.slice(0, 12)}...${hash.slice(-8)}`;
}

export function normalizeHash(value) {
  return String(value || "").toLowerCase();
}

export function evidenceTypeName(value) {
  const n = Number(value || 0);

  if (n === 1) return "Trade Receipt";
  if (n === 2) return "Liquidity Receipt";
  if (n === 3) return "Pool Audit Report";
  if (n === 4) return "Governance Proposal";

  return "Unknown Evidence";
}

export function getRecordField(record, namedKey, index) {
  return record?.[namedKey] ?? record?.[index];
}

export function anchorStatusLabel(status) {
  if (status === "anchored") return "Anchored";
  if (status === "anchor-failed") return "Anchor Failed";
  return "Not Anchored";
}