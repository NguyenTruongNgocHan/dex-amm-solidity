import { ethers } from "ethers";
import { HARDHAT_CHAIN_ID } from "../config/contracts";

export function hasMetaMask() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function getBrowserProvider() {
  if (!hasMetaMask()) {
    throw new Error("MetaMask is not installed.");
  }

  return new ethers.BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getBrowserProvider();

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  };
}

export async function ensureHardhatNetwork() {
  if (!hasMetaMask()) {
    throw new Error("MetaMask is not installed.");
  }

  const chainIdHex = `0x${HARDHAT_CHAIN_ID.toString(16)}`;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: "Hardhat Local",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["http://127.0.0.1:8545"],
          },
        ],
      });
      return;
    }

    throw error;
  }
}