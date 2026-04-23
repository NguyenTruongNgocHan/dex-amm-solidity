import SurfaceCard from "../../components/common/SurfaceCard";

const items = [
  { symbol: "TKB", time: "01:36 PM", side: "BUY", detail: "90.93 → 100 TKA" },
  { symbol: "TKA", time: "01:20 PM", side: "SELL", detail: "50.00 → 54.95 TKB" },
  { symbol: "TKB", time: "12:58 PM", side: "BUY", detail: "20.00 → 22 TKA" },
];

export default function RecentTradesCard() {
  return (
    <SurfaceCard className="p-5">
      <h3 className="text-[16px] font-bold text-[var(--text)]">Recent Trades</h3>

      <div className="mt-4 space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[16px] font-bold text-[var(--text)]">
                  {item.symbol}
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">{item.time}</div>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.side === "BUY"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                }`}
              >
                {item.side}
              </div>
            </div>

            <div className="mt-3 text-sm font-medium text-[var(--muted)]">
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}