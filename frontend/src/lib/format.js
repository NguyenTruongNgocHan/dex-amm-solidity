import { ethers } from "ethers";

export function formatToken(value, decimals = 18, max = 4) {
  if (value === undefined || value === null) return "0";

  const formatted = ethers.formatUnits(value, decimals);
  const number = Number(formatted);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("en-US", {
    maximumFractionDigits: max,
  });
}

export function parseToken(value, decimals = 18) {
  const safeValue = value && value.trim() !== "" ? value : "0";
  return ethers.parseUnits(safeValue, decimals);
}

export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}