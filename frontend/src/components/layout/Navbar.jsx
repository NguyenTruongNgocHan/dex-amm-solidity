import {
  ArrowDownUp,
  BarChart3,
  Database,
  Droplets,
  Home,
  LayoutDashboard,
  Lock,
  Moon,
  ShieldCheck,
  Sprout,
  Sun,
  UserCheck,
  Wallet,
} from "lucide-react";
import Button from "../common/Button";
import useTheme from "../../hooks/useTheme";
import { shortAddress } from "../../lib/format";
import useAccessProfile from "../../hooks/useAccessProfile";

const navItems = [
  { key: "home", label: "Home", icon: <Home size={14} />, access: "public" },
  { key: "trade", label: "Trade", icon: <ArrowDownUp size={14} />, access: "public" },
  { key: "liquidity", label: "Liquidity", icon: <Droplets size={14} />, access: "public" },
  { key: "farm", label: "Farm", icon: <Sprout size={14} />, access: "connected" },
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} />, access: "public" },
  { key: "evidence", label: "Evidence", icon: <Database size={14} />, access: "public" },
  { key: "access", label: "Access", icon: <UserCheck size={14} />, access: "connected" },
  { key: "admin", label: "Admin", icon: <ShieldCheck size={14} />, access: "admin" },
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

  const roleLabel = profile.isAdmin
    ? "Admin"
    : profile.isOperator
    ? "Operator"
    : profile.isAuditor
    ? "Auditor"
    : profile.participantLabel;

  function canAccess(item) {
    if (item.access === "public") return true;
    if (item.access === "connected") return Boolean(walletAddress);
    if (item.access === "admin") return profile.canViewAdmin;
    return false;
  }

  const navItem = (item) => {
    const active = currentPage === item.key;
    const allowed = canAccess(item);

    return (
      <button
        key={item.key}
        disabled={!allowed}
        onClick={() => allowed && onNavigate?.(item.key)}
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
          onClick={() => onNavigate?.("home")}
          className="flex min-w-[160px] items-center gap-3 text-left"
        >
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/25">
            <BarChart3 size={19} />
          </div>

          <div className="leading-tight">
            <div className="text-base font-black tracking-tight text-[var(--text)]">
              DEXCK
            </div>
            <div className="max-w-[120px] truncate text-[11px] font-bold text-[var(--muted)]">
              AMM · Swap · Farm
            </div>
          </div>
        </button>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-1">
            {navItems.map(navItem)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {walletAddress ? (
            <div className="hidden h-9 items-center rounded-full border border-[var(--primary-border)] bg-[var(--primary-soft)] px-3 text-[11px] font-black text-[var(--primary-dark)] lg:inline-flex">
              {roleLabel}
            </div>
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