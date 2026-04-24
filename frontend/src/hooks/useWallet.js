import { useEffect, useState } from "react";
import {
  connectWallet,
  ensureHardhatNetwork,
  getBrowserProvider,
} from "../lib/web3";

export default function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(null);
  const [status, setStatus] = useState("");

  async function connect() {
    try {
      console.log("useWallet.connect called");

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
      }

      setStatus("Connecting MetaMask...");

      await ensureHardhatNetwork();

      const result = await connectWallet();

      setProvider(result.provider);
      setSigner(result.signer);
      setAddress(result.address);
      setChainId(result.chainId);
      setStatus("Wallet connected.");

      console.log("Connected:", result.address);
    } catch (error) {
      console.error(error);
      setStatus(error.shortMessage || error.message || "Failed to connect wallet.");
      alert(error.shortMessage || error.message || "Failed to connect wallet.");
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setAddress("");
        setSigner(null);
        setStatus("Wallet disconnected.");
        return;
      }

      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
    };

    const onChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  return {
    provider,
    signer,
    address,
    chainId,
    status,
    connect,
    setStatus,
  };
}