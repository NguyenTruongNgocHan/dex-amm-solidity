import { useMemo, useState } from "react";
import { Radar } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import SurfaceCard from "../components/common/SurfaceCard";
import useSystemEvents from "../hooks/useSystemEvents";
import useAMMData from "../hooks/useAMMData";
import { getAMM } from "../lib/contracts";
import {
  evidenceURIFromCid,
  hashJsonContent,
  uploadJsonToIPFS,
} from "../lib/ipfs";
import { downloadJson } from "../features/ipfs/utils/downloadJson";
import { getFailedTransactions } from "../features/risk/utils/failedTransactions";
import {
  buildForensicSignals,
  buildForensicTimeline,
  summarizeSignals,
} from "../features/forensics/utils/forensicRules";
import ForensicSummaryStrip from "../features/forensics/components/ForensicSummaryStrip";
import ForensicSignalCard from "../features/forensics/components/ForensicSignalCard";
import ForensicTimeline from "../features/forensics/components/ForensicTimeline";
import ForensicReportPanel from "../features/forensics/components/ForensicReportPanel";

export default function ForensicsPage({
  onNavigate,
  wallet,
  activityRefreshKey,
}) {
  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 180);
  const amm = useAMMData(wallet.provider, wallet.address);
  const [anchorStatus, setAnchorStatus] = useState("");

  const failedTransactions = useMemo(() => getFailedTransactions(), []);

  const signals = useMemo(
    () => buildForensicSignals(activity.allEvents, failedTransactions, amm.data),
    [activity.allEvents, failedTransactions, amm.data]
  );

  const timeline = useMemo(
    () => buildForensicTimeline(activity.allEvents, failedTransactions),
    [activity.allEvents, failedTransactions]
  );

  const summary = useMemo(() => summarizeSignals(signals), [signals]);

  const report = useMemo(
    () => ({
      type: "pool-audit-report",
      project: "DEXCK AMM",
      generatedAt: new Date().toISOString(),
      generatedBy: wallet.address || "disconnected",
      summary,
      pool: {
        reserveA: amm.data.reserveA,
        reserveB: amm.data.reserveB,
        priceAinB: amm.data.priceAinB,
        hasLiquidity: amm.data.hasLiquidity,
      },
      signals,
      timeline: timeline.slice(0, 50),
      note: "This forensic report is generated from on-chain events and frontend-captured failed attempts. It flags suspicious patterns for auditor review, not automatic fraud conclusion.",
    }),
    [wallet.address, summary, amm.data, signals, timeline]
  );

  async function handleDownloadReport() {
    downloadJson(report, `dexck-forensic-report-${Date.now()}.json`);
  }

  async function handleAnchorReport() {
    try {
      if (!wallet?.signer) {
        throw new Error("Connect wallet to anchor forensic report.");
      }

      setAnchorStatus("Uploading forensic report...");

      const upload = await uploadJsonToIPFS(
        report,
        `dexck-forensic-report-${Date.now()}.json`
      );

      const ammContract = getAMM(wallet.signer);
      const subject = hashJsonContent({
        type: "forensic-report-subject",
        generatedAt: report.generatedAt,
        generatedBy: wallet.address,
      });
      const contentHash = hashJsonContent(report);
      const evidenceURI = evidenceURIFromCid(upload.cid);

      setAnchorStatus("Anchoring forensic report on-chain...");

      const tx = await ammContract.submitEvidence(
        subject,
        3,
        contentHash,
        evidenceURI
      );

      await tx.wait();

      setAnchorStatus(
        `Forensic report anchored on-chain. Tx: ${tx.hash.slice(
          0,
          10
        )}...${tx.hash.slice(-8)}`
      );
    } catch (error) {
      console.error(error);
      setAnchorStatus(error.message || "Anchor forensic report failed.");
    }
  }

  return (
    <AppShell
      currentPage="forensics"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <PageHero
          badge="Blockchain Forensics"
          icon={<Radar size={14} />}
          title="Investigate protocol"
          highlight="behavior"
          description="Forensic monitoring for whale swaps, liquidity drain, failed attempts, and evidence integrity across DEX activity."
          stats={[
            { label: "Signals", value: summary.total },
            { label: "Critical", value: summary.Critical },
            { label: "High", value: summary.High },
          ]}
        />

        <div className="mt-6">
          <ForensicSummaryStrip summary={summary} />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <SurfaceCard className="p-5">
            <div>
              <div className="dex-chip">Investigation Signals</div>
              <h2 className="mt-3 text-2xl font-black text-[var(--text)]">
                Suspicious Behavior Signals
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Rule-based forensic signals derived from on-chain events,
                liquidity movement, evidence status, and failed attempts.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              {activity.loading ? (
                <EmptyState text="Loading forensic events..." />
              ) : signals.length === 0 ? (
                <EmptyState text="No forensic signal detected." />
              ) : (
                signals.map((signal) => (
                  <ForensicSignalCard key={signal.id} signal={signal} />
                ))
              )}
            </div>
          </SurfaceCard>

          <div className="grid gap-5">
            <ForensicReportPanel
              report={report}
              anchorStatus={anchorStatus}
              onDownload={handleDownloadReport}
              onAnchor={handleAnchorReport}
            />

            <ForensicTimeline items={timeline} />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state min-h-[220px]">
      <div className="text-center text-sm font-bold text-[var(--muted)]">
        {text}
      </div>
    </div>
  );
}