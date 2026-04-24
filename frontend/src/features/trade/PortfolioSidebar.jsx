import SurfaceCard from "../../components/common/SurfaceCard";
import IconBadge from "../../components/common/IconBadge";

export default function PortfolioSidebar({ ammData }) {
  const items = [
    {
      symbol: "TKA",
      amount: ammData?.tokenABalance ?? "0",
      value: "Token A",
      tone: "primary",
    },
    {
      symbol: "TKB",
      amount: ammData?.tokenBBalance ?? "0",
      value: "Token B",
      tone: "soft",
    },
    {
      symbol: "LPT",
      amount: ammData?.lpBalance ?? "0",
      value: "LP Token",
      tone: "neutral",
    },
  ];

  return (
    <SurfaceCard className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[var(--text)]">My Portfolio</h3>
        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          Local
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
                  <div className="text-sm text-[var(--muted)]">{item.value}</div>
                </div>
              </div>

              <div className="max-w-[90px] truncate text-right text-[15px] font-bold text-[var(--text)]">
                {item.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}