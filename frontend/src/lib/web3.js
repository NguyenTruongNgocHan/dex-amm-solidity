import { ethers } from "ethers";

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
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

  return { provider, signer, address };
}