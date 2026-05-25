import {
  ArrowDownUp,
  BarChart3,
  Droplets,
  Home,
  LayoutDashboard,
  Lock,
  Moon,
  ShieldCheck,
  Sprout,
  Sun,
  Wallet,
} from "lucide-react";
import Button from "../common/Button";
import useTheme from "../../hooks/useTheme";
import { shortAddress } from "../../lib/format";
import useAccessProfile from "../../hooks/useAccessProfile";

const navItems = [
  {
    key: "home",
    label: "Home",
    icon: <Home size={15} />,
    access: "public",
  },
  {
    key: "trade",
    label: "Trade",
    icon: <ArrowDownUp size={15} />,
    access: "public",
  },
  {
    key: "liquidity",
    label: "Liquidity",
    icon: <Droplets size={15} />,
    access: "liquidity",
  },
  {
    key: "farm",
    label: "Farm",
    icon: <Sprout size={15} />,
    access: "connected",
  },
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={15} />,
    access: "connected",
  },
  {
    key: "access",
    label: "Access",
    icon: <ShieldCheck size={15} />,
    access: "connected",
  },
  {
    key: "admin",
    label: "Admin",
    icon: <ShieldCheck size={15} />,
    access: "admin",
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

  function canAccess(item) {
    if (item.access === "public") return true;
    if (item.access === "connected") return Boolean(walletAddress);
    if (item.access === "liquidity") return Boolean(walletAddress);
    if (item.access === "admin") return profile.canViewAdmin;

    return false;
  }

  function getAccessHint(item) {
    if (item.access === "public") return "Public";
    if (item.access === "connected") return "Connect wallet required";
    if (item.access === "liquidity") {
      return profile.isLpApprovalRequired
        ? "Verified LP required to add liquidity"
        : "Wallet required";
    }
    if (item.access === "admin") return "Admin / Operator / Auditor only";

    return "";
  }

  const navItem = (item) => {
    const active = currentPage === item.key;
    const allowed = canAccess(item);

    return (
      <button
        key={item.key}
        title={getAccessHint(item)}
        disabled={!allowed}
        onClick={() => {
          if (allowed) onNavigate?.(item.key);
        }}
        className={`group inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-bold transition duration-200 ${active
            ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950"
            : allowed
              ? "text-[var(--muted)] hover:-translate-y-0.5 hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              : "cursor-not-allowed text-[var(--muted)] opacity-40"
          }`}
      >
        <span className={active ? "text-current" : "text-[var(--primary)]"}>
          {allowed ? item.icon : <Lock size={15} />}
        </span>
        {item.label}
      </button>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => onNavigate?.("home")}
          className="group flex items-center gap-3 text-left"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/25 transition group-hover:scale-105">
            <BarChart3 size={21} />
          </div>

          <div>
            <div className="text-[19px] font-black tracking-tight text-[var(--text)]">
              DEXCK
            </div>
            <div className="text-xs font-semibold text-[var(--muted)]">
              AMM · Access Control · Audit-ready
            </div>
          </div>
        </button>

        <div className="hidden items-center gap-1.5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-1.5 md:flex">
          {navItems.map(navItem)}
        </div>

        <div className="flex items-center gap-3">
          {walletAddress ? (
            <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-bold text-[var(--text)] lg:block">
              {profile.isAdmin
                ? "Admin"
                : profile.isOperator
                  ? "Operator"
                  : profile.isAuditor
                    ? "Auditor"
                    : profile.participantLabel}
            </div>
          ) : null}

          <button
            onClick={toggleTheme}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:text-[var(--primary-dark)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Button
            variant={walletAddress ? "secondary" : "primary"}
            onClick={onConnect}
          >
            <Wallet size={16} />
            {walletAddress ? shortAddress(walletAddress) : "Connect"}
          </Button>
        </div>
      </div>
    </nav>
  );
}