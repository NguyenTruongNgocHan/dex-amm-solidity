import { useState } from "react";
import {
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  Siren,
  UserCog,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import PageHero from "../components/common/PageHero";
import SurfaceCard from "../components/common/SurfaceCard";
import Button from "../components/common/Button";
import StatusBanner from "../components/common/StatusBanner";
import SystemActivityCard from "../features/activity/SystemActivityCard";

import useAdminControls, {
  ROLE_KEYS,
  ROLE_LABELS,
} from "../hooks/useAdminControls";
import useSystemEvents from "../hooks/useSystemEvents";

export default function AdminPage({ onNavigate, wallet, activityRefreshKey }) {
  const admin = useAdminControls(wallet);
  const activity = useSystemEvents(wallet.provider, activityRefreshKey, 8);

  const [target, setTarget] = useState("amm");
  const [roleKey, setRoleKey] = useState(ROLE_KEYS.OPERATOR);
  const [account, setAccount] = useState("");

  const [auditTarget, setAuditTarget] = useState("amm");
  const [auditSubject, setAuditSubject] = useState("phase-2-role-control");
  const [auditURI, setAuditURI] = useState("ipfs://demo-audit-note");

  const [lpCandidate, setLpCandidate] = useState("");
  const [lpReviewURI, setLpReviewURI] = useState("ipfs://lp-review-evidence");

  const canAdmin = admin.ammState?.isAdmin || admin.stakingState?.isAdmin;
  const canOperate =
    admin.ammState?.isOperator ||
    admin.stakingState?.isOperator ||
    canAdmin;
  const canAudit =
    admin.ammState?.isAuditor ||
    admin.stakingState?.isAuditor ||
    canAdmin;

  return (
    <AppShell
      currentPage="admin"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <PageHero
          badge="Protocol Governance"
          icon={<ShieldCheck size={14} />}
          title="Manage"
          highlight="DEX security"
          description="Production-grade access control, protocol safety, token whitelist policy, verified LP review, and decentralized audit evidence."
          stats={[
            {
              label: "Current Role",
              value: canAdmin
                ? "Admin"
                : canOperate
                ? "Operator"
                : canAudit
                ? "Auditor"
                : "Viewer",
            },
            {
              label: "Trading",
              value: admin.ammState?.tradingEnabled ? "Enabled" : "Disabled",
            },
            {
              label: "LP Policy",
              value: admin.ammState?.lpApprovalRequired ? "Verified" : "Open",
            },
          ]}
        />

        <div className="mt-4">
          <StatusBanner message={admin.status} />
        </div>

        {!wallet.address ? (
          <div className="mt-4">
            <StatusBanner
              type="warning"
              title="Wallet required"
              message="Connect an admin/operator/auditor wallet to manage protocol controls."
            />
          </div>
        ) : null}

        <section className="mt-6 grid gap-5 xl:grid-cols-12">
          <SurfaceCard className="p-6 xl:col-span-6">
            <SectionTitle
              icon={<UserCog size={20} />}
              title="Role Management"
              subtitle="Admin can grant or revoke roles for AMM and staking contracts."
            />

            <div className="mt-6 grid gap-4">
              <Field label="Target contract">
                <select
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                >
                  <option value="amm">AMM</option>
                  <option value="staking">Staking Rewards</option>
                </select>
              </Field>

              <Field label="Role">
                <select
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                  value={roleKey}
                  onChange={(event) => setRoleKey(event.target.value)}
                >
                  <option value={ROLE_KEYS.ADMIN}>Admin</option>
                  <option value={ROLE_KEYS.OPERATOR}>Operator</option>
                  <option value={ROLE_KEYS.AUDITOR}>Auditor</option>
                </select>
              </Field>

              <Field label="Wallet address">
                <input
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  placeholder="0x..."
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                />
              </Field>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                disabled={!canAdmin || admin.loading || !account}
                onClick={() => admin.grantRole(target, roleKey, account)}
              >
                Grant {ROLE_LABELS[roleKey]}
              </Button>

              <Button
                variant="secondary"
                disabled={!canAdmin || admin.loading || !account}
                onClick={() => admin.revokeRole(target, roleKey, account)}
              >
                Revoke {ROLE_LABELS[roleKey]}
              </Button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 xl:col-span-6">
            <SectionTitle
              icon={<Siren size={20} />}
              title="Emergency Control"
              subtitle="Admin pauses contracts. Operator can enable or disable AMM trading."
            />

            <div className="mt-6 grid gap-4">
              <ControlBlock
                title="AMM Pause Control"
                state={admin.ammState?.paused ? "Paused" : "Active"}
              >
                <Button
                  disabled={!canAdmin || admin.loading}
                  onClick={() => admin.pause("amm")}
                >
                  <PauseCircle size={16} />
                  Pause AMM
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canAdmin || admin.loading}
                  onClick={() => admin.unpause("amm")}
                >
                  <PlayCircle size={16} />
                  Unpause AMM
                </Button>
              </ControlBlock>

              <ControlBlock
                title="Trading Status"
                state={admin.ammState?.tradingEnabled ? "Enabled" : "Disabled"}
              >
                <Button
                  disabled={!canOperate || admin.loading}
                  onClick={() => admin.setTradingEnabled(true)}
                >
                  Enable Trading
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canOperate || admin.loading}
                  onClick={() => admin.setTradingEnabled(false)}
                >
                  Disable Trading
                </Button>
              </ControlBlock>

              <ControlBlock
                title="Staking Pause Control"
                state={admin.stakingState?.paused ? "Paused" : "Active"}
              >
                <Button
                  disabled={!canAdmin || admin.loading}
                  onClick={() => admin.pause("staking")}
                >
                  Pause Staking
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canAdmin || admin.loading}
                  onClick={() => admin.unpause("staking")}
                >
                  Unpause Staking
                </Button>
              </ControlBlock>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 xl:col-span-12">
            <SectionTitle
              icon={<ShieldCheck size={20} />}
              title="Production Policy"
              subtitle="Operator controls token whitelist and verified LP policy. This prevents unsafe token/pool operations while keeping swaps permissionless."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <PolicyCard
                title="Token A Whitelist"
                state={
                  admin.ammState?.tokenAWhitelisted
                    ? "Whitelisted"
                    : "Blocked"
                }
              >
                <Button
                  disabled={!canOperate || admin.loading}
                  onClick={() => admin.setTokenWhitelist(admin.tokenAAddress, true)}
                >
                  Whitelist Token A
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canOperate || admin.loading}
                  onClick={() =>
                    admin.setTokenWhitelist(admin.tokenAAddress, false)
                  }
                >
                  Block Token A
                </Button>
              </PolicyCard>

              <PolicyCard
                title="Token B Whitelist"
                state={
                  admin.ammState?.tokenBWhitelisted
                    ? "Whitelisted"
                    : "Blocked"
                }
              >
                <Button
                  disabled={!canOperate || admin.loading}
                  onClick={() => admin.setTokenWhitelist(admin.tokenBAddress, true)}
                >
                  Whitelist Token B
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canOperate || admin.loading}
                  onClick={() =>
                    admin.setTokenWhitelist(admin.tokenBAddress, false)
                  }
                >
                  Block Token B
                </Button>
              </PolicyCard>

              <PolicyCard
                title="Verified LP Policy"
                state={admin.ammState?.lpApprovalRequired ? "Required" : "Open"}
              >
                <Button
                  disabled={!canOperate || admin.loading}
                  onClick={() =>
                    admin.setLiquidityProviderApprovalRequired(true)
                  }
                >
                  Require Verified LP
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canOperate || admin.loading}
                  onClick={() =>
                    admin.setLiquidityProviderApprovalRequired(false)
                  }
                >
                  Open LP Access
                </Button>
              </PolicyCard>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 xl:col-span-12">
            <SectionTitle
              icon={<UserCog size={20} />}
              title="Verified Liquidity Provider Review"
              subtitle="Admin approves or rejects LP candidates using on-chain participant status and IPFS evidence."
            />

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
              <Field label="Candidate wallet address">
                <input
                  value={lpCandidate}
                  onChange={(event) => setLpCandidate(event.target.value)}
                  placeholder="0x..."
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                />
              </Field>

              <Field label="Review evidence URI">
                <input
                  value={lpReviewURI}
                  onChange={(event) => setLpReviewURI(event.target.value)}
                  placeholder="ipfs://..."
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                />
              </Field>

              <Button
                disabled={!canAdmin || admin.loading || !lpCandidate}
                onClick={() =>
                  admin.reviewLiquidityProvider(lpCandidate, true, lpReviewURI)
                }
              >
                Approve LP
              </Button>

              <Button
                variant="danger"
                disabled={!canAdmin || admin.loading || !lpCandidate}
                onClick={() =>
                  admin.reviewLiquidityProvider(lpCandidate, false, lpReviewURI)
                }
              >
                Reject LP
              </Button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 xl:col-span-12">
            <SectionTitle
              icon={<ShieldCheck size={20} />}
              title="Auditor Evidence Note"
              subtitle="Auditor can submit an on-chain event that references an IPFS audit note or report."
            />

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <Field label="Target contract">
                <select
                  value={auditTarget}
                  onChange={(event) => setAuditTarget(event.target.value)}
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                >
                  <option value="amm">AMM</option>
                  <option value="staking">Staking Rewards</option>
                </select>
              </Field>

              <Field label="Audit subject">
                <input
                  value={auditSubject}
                  onChange={(event) => setAuditSubject(event.target.value)}
                  placeholder="pool-risk-report"
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                />
              </Field>

              <Field label="IPFS note URI">
                <input
                  value={auditURI}
                  onChange={(event) => setAuditURI(event.target.value)}
                  placeholder="ipfs://..."
                  className="input-shell w-full px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                />
              </Field>

              <Button
                disabled={!canAudit || admin.loading || !auditURI}
                onClick={() =>
                  admin.submitAuditNote(auditTarget, auditSubject, auditURI)
                }
              >
                Submit Audit Note
              </Button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 xl:col-span-12">
            <SectionTitle
              icon={<AlertTriangle size={20} />}
              title="Security Alert Center"
              subtitle="A compact operational overview for abnormal activity, verified liquidity access, and audit evidence."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SecurityMetric
                label="Suspicious Swaps"
                value="0"
                description="Large slippage or abnormal reserve movement detected."
                tone="danger"
              />

              <SecurityMetric
                label="Verified LPs"
                value={admin.ammState?.lpApprovalRequired ? "Required" : "Open"}
                description="LP admission policy currently enforced by governance."
                tone="success"
              />

              <SecurityMetric
                label="Audit Notes"
                value={canAudit ? "Enabled" : "Restricted"
                }
                description="Auditor role can publish IPFS-backed audit references."
                tone="blue"
              />
            </div>
          </SurfaceCard>

          <div className="xl:col-span-12">
            <SystemActivityCard
              events={activity.events}
              allEvents={activity.allEvents}
              loading={activity.loading}
              onRefresh={activity.reloadEvents}
              wallet={wallet}
              title="Protocol Timeline"
              description="Track governance actions, trading events, staking updates, and administrative activity."
              scroll
              maxHeight="380px"
            />
          </div>

          
        </section>
      </PageContainer>
    </AppShell>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-black text-[var(--text)]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[var(--text)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ControlBlock({ title, state, children }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-[var(--text)]">{title}</h3>
        <span className="dex-chip">{state}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function PolicyCard({ title, state, children }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="max-w-[170px] text-lg font-black text-[var(--text)]">
          {title}
        </h3>
        <span className="dex-chip">{state}</span>
      </div>

      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  );
}

function SecurityMetric({ label, value, description, tone }) {
  const cls = {
    danger:
      "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
    success:
      "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
    blue: "border-[var(--blue-border)] bg-[var(--blue-soft)] text-[var(--blue)]",
  }[tone];

  return (
    <div className={`rounded-3xl border p-5 ${cls}`}>
      <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      <p className="mt-3 text-3xl font-black text-[var(--text)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}