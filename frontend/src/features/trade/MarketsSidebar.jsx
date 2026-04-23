import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

const markets = [
  { symbol: "TKA", name: "Token A", price: "1.0000", change: "+0.00%", active: true },
  { symbol: "TKB", name: "Token B", price: "0.9093", change: "+0.00%" },
  { symbol: "LPT", name: "LP Token", price: "1.2040", change: "+0.00%" },
];

export default function MarketsSidebar() {
  return (
    <SurfaceCard className="p-4">
      <h3 className="text-[16px] font-bold text-[var(--text)]">Markets</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">3 tokens available</p>

      <div className="mt-4 space-y-3">
        {markets.map((item) => (
          <div
            key={item.symbol}
            className={`rounded-[18px] border px-4 py-4 ${
              item.active
                ? "border-teal-200 bg-teal-50 dark:border-teal-500/20 dark:bg-teal-500/10"
                : "border-[var(--border)] bg-[var(--surface-soft)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconBadge
                  tone={item.active ? "primary" : "neutral"}
                  className="h-11 w-11 text-base font-bold"
                >
                  {item.symbol[0]}
                </IconBadge>

                <div>
                  <div className="text-[16px] font-bold text-[var(--text)]">
                    {item.symbol}
                  </div>
                  <div className="text-sm text-[var(--muted)]">{item.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[16px] font-bold text-[var(--text)]">
                  {item.price}
                </div>
                <div className="text-sm font-semibold text-emerald-500">
                  {item.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}