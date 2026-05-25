import { Database } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import IPFSPanelCard from "../features/ipfs/IPFSPanelCard";

export default function EvidencePage({ onNavigate, wallet }) {
  return (
    <AppShell
      currentPage="evidence"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <PageHero
          badge="Decentralized Evidence Layer"
          icon={<Database size={14} />}
          title="Verify protocol"
          highlight="evidence"
          description="Inspect trade receipts, governance proposals, token metadata, and IPFS-backed audit records in one forensic evidence center."
          stats={[
            { label: "Evidence Type", value: "Receipts / Metadata / Proposals" },
            { label: "Storage Layer", value: "IPFS / Local Gateway" },
            { label: "Audit Mode", value: "Exportable JSON" },
          ]}
        />

        <section className="mt-6">
          <IPFSPanelCard walletAddress={wallet.address} />
        </section>
      </PageContainer>
    </AppShell>
  );
}