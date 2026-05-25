import { useState } from "react";
import { ethers } from "ethers";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import SurfaceCard from "../components/common/SurfaceCard";
import Button from "../components/common/Button";
import useAccessProfile from "../hooks/useAccessProfile";
import { getAMM } from "../lib/contracts";
import { UserCheck } from "lucide-react";
import PageHero from "../components/common/PageHero";
export default function AccessRequestPage({ onNavigate, wallet }) {
  const access = useAccessProfile(wallet);

  const [profileText, setProfileText] = useState(
    "Verified LP profile for DEX AMM demo"
  );
  const [evidenceURI, setEvidenceURI] = useState("ipfs://lp-evidence-demo");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submitRequest() {
    try {
      if (!wallet.signer) {
        await wallet.connect();
        return;
      }

      setPending(true);
      setStatus("Submitting LP approval request...");

      const amm = getAMM(wallet.signer);
      const profileHash = ethers.keccak256(ethers.toUtf8Bytes(profileText));

      const tx = await amm.requestLiquidityProviderApproval(
        profileHash,
        evidenceURI
      );

      await tx.wait();

      setStatus("LP approval request submitted on-chain.");
      await access.reload();
    } catch (error) {
      console.error(error);
      setStatus(
        error.shortMessage || error.message || "Failed to submit request."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell
      currentPage="access"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <PageHero
          badge="Verified LP Registration"
          icon={<UserCheck size={14} />}
          title="Request verified"
          highlight="liquidity access"
          description="Swap remains permissionless. This request is only for wallets that want to become verified liquidity providers when production policy mode is enabled."
          stats={[
            {
              label: "Current wallet",
              value: wallet.address ? "Connected" : "Not connected",
            },
            {
              label: "Profile hash",
              value: "Stored on-chain",
            },
            {
              label: "Evidence",
              value: "IPFS URI",
            },
          ]}
        />

        {status ? (
          <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)]">
            {status}
          </div>
        ) : null}

        <SurfaceCard className="p-5">
          <div className="grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-bold text-[var(--text)]">
                Profile summary
              </span>
              <textarea
                value={profileText}
                onChange={(event) => setProfileText(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-[var(--text)]">
                Evidence URI / IPFS CID
              </span>
              <input
                value={evidenceURI}
                onChange={(event) => setEvidenceURI(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                placeholder="ipfs://..."
              />
            </label>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted)]">
              The contract stores only a profile hash and evidence URI. The
              detailed evidence should stay on IPFS/off-chain storage, while the
              approval decision is recorded on-chain through events.
            </div>

            <Button
              size="lg"
              disabled={pending || !profileText || !evidenceURI}
              onClick={submitRequest}
            >
              {pending ? "Submitting..." : "Submit Verified LP Request"}
            </Button>
          </div>
        </SurfaceCard>
      </PageContainer>
    </AppShell>
  );
}