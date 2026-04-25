import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function PortfolioSidebar({ ammData, connected }) {
  const items = [
    {
      symbol: "TKA",
      name: "Token A",
      amount: connected ? ammData.tokenABalance : "—",
      tone: "primary",
    },
    {
      symbol: "TKB",
      name: "Token B",
      amount: connected ? ammData.tokenBBalance : "—",
      tone: "soft",
    },
    {
      symbol: "LPT",
      name: "LP Token",
      amount: connected ? ammData.lpBalance : "—",
      tone: "neutral",
    },
  ];

  return (
    <SurfaceCard className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[var(--text)]">
          My Portfolio
        </h3>

        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          {connected ? "Wallet" : "Guest"}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.symbol}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconBadge
                  tone={item.tone}
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

              <div className="max-w-[92px] truncate text-right text-sm font-bold text-[var(--text)]">
                {item.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}