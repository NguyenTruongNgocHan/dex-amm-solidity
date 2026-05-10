import { Activity, Coins, Droplets, Route } from "lucide-react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function PoolInsightStrip({ ammData, activity }) {
  const latestEvent = activity?.events?.[0];

  const items = [
    {
      icon: <Droplets size={16} />,
      label: "Pool Depth",
      value: `${ammData.reserveA} / ${ammData.reserveB}`,
      hint: "TKA / TKB",
    },
    {
      icon: <Route size={16} />,
      label: "Reserve Ratio",
      value: `1 TKA = ${ammData.priceAinB} TKB`,
      hint: "Spot pool price",
    },
    {
      icon: <Coins size={16} />,
      label: "Your LP",
      value: ammData.lpBalance,
      hint: "LP token balance",
    },
    {
      icon: <Activity size={16} />,
      label: "Latest Activity",
      value: latestEvent ? latestEvent.type : "None",
      hint: latestEvent ? `Block #${latestEvent.blockNumber}` : "No event yet",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <SurfaceCard key={item.label} className="p-4" hover>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
              {item.icon}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--muted)]">
                {item.label}
              </div>

              <div className="mt-1 break-words text-sm font-black text-[var(--text)]">
                {item.value}
              </div>

              <div className="mt-1 break-words text-xs text-[var(--muted)]">
                {item.hint}
              </div>
            </div>
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}