import { BarChart3, Moon, Sun, Wallet } from "lucide-react";
import Button from "../common/Button";
import useTheme from "../../hooks/useTheme";

export default function Navbar({ currentPage = "home", onNavigate }) {
  const { theme, toggleTheme } = useTheme();

  const navItem = (key, label) => (
    <button
      onClick={() => onNavigate?.(key)}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${
        currentPage === key
          ? "bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-white"
          : "text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => onNavigate?.("home")}
          className="flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] text-white">
            <BarChart3 size={20} />
          </div>

          <div className="text-left">
            <div className="text-[18px] font-bold tracking-tight text-[var(--text)]">
              DEXCK
            </div>
            <div className="text-xs text-[var(--muted)]">
              Decentralized Exchange
            </div>
          </div>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navItem("home", "Home")}
          {navItem("trade", "Trade")}
          {navItem("liquidity", "Liquidity")}
          {navItem("dashboard", "Dashboard")}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Button variant="secondary" className="gap-2">
            <Wallet size={15} />
            Connect
          </Button>
        </div>
      </div>
    </nav>
  );
}