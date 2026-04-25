import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function MarketsSidebar({ ammData }) {
  const markets = [
    {
      symbol: "TKA",
      name: "Token A",
      price: `${ammData.priceAinB} TKB`,
      change: "AMM",
      active: true,
    },
    {
      symbol: "TKB",
      name: "Token B",
      price: `${ammData.priceBinA} TKA`,
      change: "AMM",
      active: false,
    },
    {
      symbol: "LPT",
      name: "LP Token",
      price: ammData.lpBalance,
      change: "Balance",
      active: false,
    },
  ];

  return (
    <SurfaceCard className="p-4">
      <h3 className="text-[16px] font-bold text-[var(--text)]">Markets</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">AMM pool assets</p>

      <div className="mt-4 space-y-3">
        {markets.map((item) => (
          <div
            key={item.symbol}
            className={`rounded-[16px] border px-3 py-3 ${
              item.active
                ? "border-teal-200 bg-teal-50 dark:border-teal-500/20 dark:bg-teal-500/10"
                : "border-[var(--border)] bg-[var(--surface-soft)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconBadge
                  tone={item.active ? "primary" : "neutral"}
                  className="h-9 w-9 text-sm font-bold"
                >
                  {item.symbol[0]}
                </IconBadge>

                <div>
                  <div className="text-sm font-bold text-[var(--text)]">
                    {item.symbol}
                  </div>
                  <div className="text-xs text-[var(--muted)]">{item.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="max-w-[90px] truncate text-sm font-bold text-[var(--text)]">
                  {item.price}
                </div>
                <div className="text-xs font-semibold text-emerald-500">
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