import { BarChart3, Wallet } from "lucide-react";
import Button from "../../components/common/Button";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function DashboardHeader({ connected, onConnect }) {
  return (
    <SurfaceCard className="overflow-hidden p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary)] text-white">
            <BarChart3 size={22} />
          </div>

          <div>
            <h1 className="text-[26px] font-bold text-[var(--text)]">
              AMM Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Track pool reserves, LP position, wallet balances, and on-chain activity.
            </p>
          </div>
        </div>

        <Button variant={connected ? "secondary" : "primary"} onClick={onConnect} className="gap-2">
          <Wallet size={16} />
          {connected ? "Wallet Connected" : "Connect Wallet"}
        </Button>
      </div>
    </SurfaceCard>
  );
}