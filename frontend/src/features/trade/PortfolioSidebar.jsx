import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

const items = [
  { symbol: "TKA", amount: "1,250.00", value: "$1,250.00", tone: "primary" },
  { symbol: "TKB", amount: "920.50", value: "$920.50", tone: "soft" },
  { symbol: "LPT", amount: "120.00", value: "$120.00", tone: "neutral" },
];

export default function PortfolioSidebar() {
  return (
    <SurfaceCard className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[var(--text)]">My Portfolio</h3>
        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          $2,290.50
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.symbol}
            className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconBadge tone={item.tone} className="h-11 w-11 text-base font-bold">
                  {item.symbol[0]}
                </IconBadge>

                <div>
                  <div className="text-[16px] font-bold text-[var(--text)]">
                    {item.symbol}
                  </div>
                  <div className="text-sm text-[var(--muted)]">{item.amount}</div>
                </div>
              </div>

              <div className="text-right text-[16px] font-bold text-[var(--text)]">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}