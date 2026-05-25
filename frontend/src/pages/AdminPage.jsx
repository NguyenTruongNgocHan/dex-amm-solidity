import { useState } from "react";
import {
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import AppShell from "../components/layout/AppShell";
import PageContainer from "../components/layout/PageContainer";
import SurfaceCard from "../components/common/SurfaceCard";
import Button from "../components/common/Button";
import useAdminControls, {
  ROLE_KEYS,
  ROLE_LABELS,
} from "../hooks/useAdminControls";
import { shortAddress } from "../lib/format";

export default function AdminPage({ onNavigate, wallet }) {
  const admin = useAdminControls(wallet);

  const [target, setTarget] = useState("amm");
  const [roleKey, setRoleKey] = useState(ROLE_KEYS.OPERATOR);
  const [account, setAccount] = useState("");
  const [auditTarget, setAuditTarget] = useState("amm");
  const [auditSubject, setAuditSubject] = useState("phase-2-role-control");
  const [auditURI, setAuditURI] = useState("ipfs://demo-audit-note");

  const canAdmin = admin.ammState?.isAdmin || admin.stakingState?.isAdmin;
  const canOperate = admin.ammState?.isOperator || admin.stakingState?.isOperator;
  const canAudit = admin.ammState?.isAuditor || admin.stakingState?.isAuditor;

  return (
    <AppShell
      currentPage="admin"
      onNavigate={onNavigate}
      walletAddress={wallet.address}
      onConnect={wallet.connect}
      wallet={wallet}
    >
      <PageContainer>
        <div className="mb-6 rounded-[28px] bg-gradient-to-br from-slate-950 to-slate-800 p-7 text-white shadow-xl shadow-slate-950/20">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-teal-200">
                <ShieldCheck size={14} />
                Production Control Layer
              </div>

              <h1 className="mt-4 text-3xl font-black">
                Admin · Operator · Auditor
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                This panel demonstrates role-based access control for the DEX.
                Admin manages permissions, Operator controls trading operations,
                and Auditor records audit evidence without touching user funds.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <div className="text-slate-400">Connected wallet</div>
              <div className="mt-1 font-bold">
                {wallet.address ? shortAddress(wallet.address) : "Not connected"}
              </div>
            </div>
          </div>
        </div>

        {admin.status ? (
          <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)]">
            {admin.status}
          </div>
        ) : null}

        {!wallet.address ? (
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={18} />
              <span className="font-bold">Connect wallet to view role status.</span>
            </div>
          </SurfaceCard>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <RoleStatusCard title="AMM Contract" state={admin.ammState} />
          <RoleStatusCard title="Staking Rewards Contract" state={admin.stakingState} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <SurfaceCard className="p-5">
            <SectionTitle
              icon={<UserCog size={18} />}
              title="Role Management"
              subtitle="Admin can grant or revoke roles for AMM and Staking contracts."
            />

            <div className="mt-5 grid gap-3">
              <SelectField label="Target contract" value={target} onChange={setTarget}>
                <option value="amm">AMM</option>
                <option value="staking">Staking Rewards</option>
              </SelectField>

              <SelectField label="Role" value={roleKey} onChange={setRoleKey}>
                <option value={ROLE_KEYS.ADMIN}>Admin</option>
                <option value={ROLE_KEYS.OPERATOR}>Operator</option>
                <option value={ROLE_KEYS.AUDITOR}>Auditor</option>
              </SelectField>

              <TextField
                label="Wallet address"
                value={account}
                onChange={setAccount}
                placeholder="0x..."
              />

              <div className="grid gap-3 sm:grid-cols-2">
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

              {!canAdmin ? (
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Current wallet is not Admin. Connect the deployer/admin wallet
                  to manage roles.
                </p>
              ) : null}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <SectionTitle
              icon={<PauseCircle size={18} />}
              title="Emergency Control"
              subtitle="Admin pauses contracts. Operator can enable or disable AMM trading."
            />

            <div className="mt-5 grid gap-4">
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

          <SurfaceCard className="mt-5 p-5">
            <SectionTitle
              icon={<ShieldCheck size={18} />}
              title="Production Policy"
              subtitle="Operator controls token whitelist and verified LP policy. This prevents unsafe token/pool operations while keeping swaps permissionless."
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <ControlBlock
                title="Token A Whitelist"
                state={admin.ammState?.tokenAWhitelisted ? "Whitelisted" : "Blocked"}
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
                  onClick={() => admin.setTokenWhitelist(admin.tokenAAddress, false)}
                >
                  Block Token A
                </Button>
              </ControlBlock>

              <ControlBlock
                title="Token B Whitelist"
                state={admin.ammState?.tokenBWhitelisted ? "Whitelisted" : "Blocked"}
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
                  onClick={() => admin.setTokenWhitelist(admin.tokenBAddress, false)}
                >
                  Block Token B
                </Button>
              </ControlBlock>

              <ControlBlock
                title="Verified LP Policy"
                state={admin.ammState?.lpApprovalRequired ? "Required" : "Open"}
              >
                <Button
                  disabled={!canOperate || admin.loading}
                  onClick={() => admin.setLiquidityProviderApprovalRequired(true)}
                >
                  Require Verified LP
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canOperate || admin.loading}
                  onClick={() => admin.setLiquidityProviderApprovalRequired(false)}
                >
                  Open LP Access
                </Button>
              </ControlBlock>
            </div>

            {!canOperate ? (
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                Current wallet is not Operator. Connect an operator wallet to manage production policy.
              </p>
            ) : null}
          </SurfaceCard>
        </div>

        <SurfaceCard className="mt-5 p-5">
          <SectionTitle
            icon={<ShieldCheck size={18} />}
            title="Auditor Evidence Note"
            subtitle="Auditor can submit an on-chain event that references an IPFS audit note or report."
          />

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <SelectField
              label="Target contract"
              value={auditTarget}
              onChange={setAuditTarget}
            >
              <option value="amm">AMM</option>
              <option value="staking">Staking Rewards</option>
            </SelectField>

            <TextField
              label="Audit subject"
              value={auditSubject}
              onChange={setAuditSubject}
              placeholder="pool-risk-report"
            />

            <TextField
              label="IPFS note URI"
              value={auditURI}
              onChange={setAuditURI}
              placeholder="ipfs://..."
            />
          </div>

          <div className="mt-4">
            <Button
              disabled={!canAudit || admin.loading || !auditURI}
              onClick={() =>
                admin.submitAuditNote(auditTarget, auditSubject, auditURI)
              }
            >
              Submit Audit Note
            </Button>
          </div>

          {!canAudit ? (
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              Current wallet is not Auditor. Connect an auditor wallet to submit
              audit evidence.
            </p>
          ) : null}
        </SurfaceCard>
      </PageContainer>
    </AppShell>
  );
}

function RoleStatusCard({ title, state }) {
  return (
    <SurfaceCard className="p-5">
      <h2 className="text-lg font-black text-[var(--text)]">{title}</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RolePill label="Admin" active={state?.isAdmin} />
        <RolePill label="Operator" active={state?.isOperator} />
        <RolePill label="Auditor" active={state?.isAuditor} />
        <RolePill label="Paused" active={state?.paused} danger />
      </div>

      {"tradingEnabled" in (state || {}) ? (
        <div className="mt-3">
          <RolePill label="Trading Enabled" active={state?.tradingEnabled} />
        </div>
      ) : null}
    </SurfaceCard>
  );
}

function RolePill({ label, active, danger = false }) {
  const cls = active
    ? danger
      ? "bg-red-500/10 text-red-500 border-red-500/20"
      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    : "bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--border)]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${cls}`}>
      {label}: {active ? "Yes" : "No"}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[var(--primary)]">
        {icon}
        <h2 className="text-lg font-black text-[var(--text)]">{title}</h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
    </div>
  );
}

function ControlBlock({ title, state, children }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-bold text-[var(--text)]">{title}</div>
        <div className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
          {state}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--text)]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--text)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
      >
        {children}
      </select>
    </label>
  );
}