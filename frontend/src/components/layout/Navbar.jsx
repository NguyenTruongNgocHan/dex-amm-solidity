import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  BarChart3,
  ChevronDown,
  Database,
  Droplets,
  Home,
  LayoutDashboard,
  Lock,
  Moon,
  SearchCheck,
  ShieldCheck,
  Sprout,
  Sun,
  UserCheck,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import Button from "../common/Button";
import useTheme from "../../hooks/useTheme";
import { shortAddress } from "../../lib/format";
import useAccessProfile from "../../hooks/useAccessProfile";

const mainNavItems = [
  { key: "home", label: "Home", icon: <Home size={14} />, access: "public" },
  {
    key: "trade",
    label: "Trade",
    icon: <ArrowDownUp size={14} />,
    access: "public",
  },
  {
    key: "liquidity",
    label: "Liquidity",
    icon: <Droplets size={14} />,
    access: "public",
  },
  {
    key: "farm",
    label: "Farm",
    icon: <Sprout size={14} />,
    access: "connected",
  },
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={14} />,
    access: "public",
  },
];

const trustCenterItems = [
  {
    key: "admin",
    label: "Admin Console",
    description: "Roles, trading status, token whitelist, LP approval.",
    icon: <ShieldCheck size={15} />,
    access: "admin",
  },
  {
    key: "audit",
    label: "Audit Trail",
    description: "Trace on-chain events and transaction evidence.",
    icon: <SearchCheck size={15} />,
    access: "trust",
  },
  {
    key: "risk",
    label: "Risk Monitor",
    description: "Flag suspicious swaps and abnormal protocol activity.",
    icon: <AlertTriangle size={15} />,
    access: "trust",
  },
  {
    key: "evidence",
    label: "IPFS Evidence",
    description: "Receipts, token list, proposals, and audit reports.",
    icon: <Database size={15} />,
    access: "trust",
  },
];

export default function Navbar({
  currentPage = "home",
  onNavigate,
  walletAddress,
  onConnect,
  wallet,
}) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAccessProfile(wallet);
  const [trustOpen, setTrustOpen] = useState(false);
  const trustRef = useRef(null);

  const roleLabel = profile.isAdmin
    ? "Admin"
    : profile.isOperator
    ? "Operator"
    : profile.isAuditor
    ? "Auditor"
    : profile.participantLabel;

  const trustCenterActive = ["admin", "audit", "risk", "evidence"].includes(
    currentPage
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (trustRef.current && !trustRef.current.contains(event.target)) {
        setTrustOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function canAccess(item) {
    if (item.access === "public") return true;
    if (item.access === "connected") return Boolean(walletAddress);
    if (item.access === "admin") return profile.canViewAdmin;
    if (item.access === "trust") {
      return profile.canViewAdmin || profile.canAudit || profile.canManagePolicy;
    }

    return false;
  }

  function handleNavigate(key) {
    setTrustOpen(false);
    onNavigate?.(key);
  }

  const navItem = (item) => {
    const active = currentPage === item.key;
    const allowed = canAccess(item);

    return (
      <button
        key={item.key}
        disabled={!allowed}
        onClick={() => allowed && handleNavigate(item.key)}
        className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black transition ${
          active
            ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950"
            : allowed
            ? "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
            : "cursor-not-allowed text-[var(--muted)] opacity-40"
        }`}
      >
        <span className={active ? "text-slate-950" : "text-[var(--primary)]"}>
          {allowed ? item.icon : <Lock size={14} />}
        </span>
        {item.label}
      </button>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/88 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-5">
        <button
          onClick={() => handleNavigate("home")}
          className="flex min-w-[160px] items-center gap-3 text-left"
        >
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/25">
            <BarChart3 size={19} />
          </div>

          <div className="leading-tight">
            <div className="text-base font-black tracking-tight text-[var(--text)]">
              DEXCK
            </div>
            <div className="max-w-[128px] truncate text-[11px] font-bold text-[var(--muted)]">
              AMM · Trust Layer
            </div>
          </div>
        </button>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-1">
            {mainNavItems.map(navItem)}

            <div className="relative" ref={trustRef}>
              <button
                disabled={!walletAddress}
                onClick={() => walletAddress && setTrustOpen((prev) => !prev)}
                className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black transition ${
                  trustCenterActive
                    ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950"
                    : walletAddress
                    ? "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                    : "cursor-not-allowed text-[var(--muted)] opacity-40"
                }`}
              >
                <span
                  className={
                    trustCenterActive
                      ? "text-slate-950"
                      : "text-[var(--primary)]"
                  }
                >
                  {walletAddress ? <ShieldCheck size={14} /> : <Lock size={14} />}
                </span>
                Trust Center
                <ChevronDown
                  size={13}
                  className={`transition ${trustOpen ? "rotate-180" : ""}`}
                />
              </button>

              {trustOpen ? (
                <div className="absolute right-0 top-12 w-[360px] rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl shadow-black/15">
                  <div className="mb-2 px-2">
                    <div className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
                      Production Operations
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[var(--muted)]">
                      Role-gated tools for authority, traceability, and
                      evidence.
                    </div>
                  </div>

                  <div className="grid gap-1">
                    {trustCenterItems.map((item) => {
                      const allowed = canAccess(item);

                      return (
                        <button
                          key={item.key}
                          disabled={!allowed}
                          onClick={() => allowed && handleNavigate(item.key)}
                          className={`flex items-start gap-3 rounded-2xl p-3 text-left transition ${
                            allowed
                              ? "hover:bg-[var(--surface-soft)]"
                              : "cursor-not-allowed opacity-45"
                          }`}
                        >
                          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)]">
                            {allowed ? item.icon : <Lock size={15} />}
                          </div>

                          <div>
                            <div className="text-sm font-black text-[var(--text)]">
                              {item.label}
                            </div>
                            <div className="mt-0.5 text-xs font-semibold leading-relaxed text-[var(--muted)]">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {walletAddress ? (
            <button
              onClick={() => handleNavigate("access")}
              className="hidden h-9 items-center gap-2 rounded-full border border-[var(--primary-border)] bg-[var(--primary-soft)] px-3 text-[11px] font-black text-[var(--primary-dark)] transition hover:border-[var(--primary)] lg:inline-flex"
            >
              <UserCheck size={13} />
              {roleLabel}
            </button>
          ) : null}

          <button
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] transition hover:border-[var(--primary-border)]"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Button
            variant={walletAddress ? "secondary" : "primary"}
            onClick={onConnect}
            className="h-9 rounded-full px-3 text-xs"
          >
            <Wallet size={14} />
            {walletAddress ? shortAddress(walletAddress) : "Connect"}
          </Button>
        </div>
      </div>
    </nav>
  );
}