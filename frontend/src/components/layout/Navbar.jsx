import { BarChart3, Wallet, Moon, Sun } from "lucide-react";
import Button from "../common/Button";
import useTheme from "../../hooks/useTheme";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary)] text-white">
            <BarChart3 size={22} />
          </div>

          <div>
            <div className="text-3xl font-black text-[var(--primary-dark)]">
              DEXCK
            </div>
            <div className="text-sm text-[var(--muted)]">
              AMM-powered decentralized trading
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="font-semibold text-[var(--text)]">
            Home
          </a>
          <a href="#" className="font-semibold text-[var(--primary-dark)]">
            Trade
          </a>
          <a href="#" className="font-semibold text-[var(--text)]">
            Liquidity
          </a>
          <a href="#" className="font-semibold text-[var(--text)]">
            Dashboard
          </a>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--border)] p-2 hover:bg-[var(--surface-soft)]"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Button variant="secondary" className="gap-2">
            <Wallet size={16} />
            Connect
          </Button>
        </div>
      </div>
    </header>
  );
}