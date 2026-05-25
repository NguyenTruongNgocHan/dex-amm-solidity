import { ethers } from "ethers";

export function maskAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function createWalletHash(address, salt = "dexck-wallet-privacy-v1") {
  if (!address) return "";

  return ethers.keccak256(
    ethers.toUtf8Bytes(`${address.toLowerCase()}-${salt}`)
  );
}

export function createTraderAlias(address) {
  const hash = createWalletHash(address);
  if (!hash) return "Unknown Trader";

  return `Trader #${hash.slice(2, 8).toUpperCase()}`;
}