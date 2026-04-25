import SurfaceCard from "../common/SurfaceCard";

export default function TradeChartMock({ ammData }) {
  return (
    <SurfaceCard className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-bold text-[var(--text)]">
            Pool Price History
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Current price: 1 TKA = {ammData.priceAinB} TKB
          </p>
        </div>

        <div className="flex gap-2">
          {["1H", "24H", "7D", "30D"].map((item, idx) => (
            <button
              key={item}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                idx === 1
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(45,212,191,0.05),rgba(45,212,191,0.01))] p-4">
        <svg viewBox="0 0 100 36" className="h-[220px] w-full">
          <defs>
            <linearGradient id="chartFillTealPolished" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(45,212,191,0.20)" />
              <stop offset="100%" stopColor="rgba(45,212,191,0.01)" />
            </linearGradient>
          </defs>

          <path
            d="M0,27 C10,24 16,20 25,15 C34,10 42,8 52,9 C63,10 72,16 80,23 C88,29 94,32 100,35 L100,36 L0,36 Z"
            fill="url(#chartFillTealPolished)"
          />
          <path
            d="M0,27 C10,24 16,20 25,15 C34,10 42,8 52,9 C63,10 72,16 80,23 C88,29 94,32 100,35"
            fill="none"
            stroke="rgba(34, 197, 184, 0.95)"
            strokeWidth="1.1"
          />
        </svg>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-4">
        <MiniStat label="Reserve A" value={ammData.reserveA} />
        <MiniStat label="Reserve B" value={ammData.reserveB} tone="success" />
        <MiniStat
          label="Pool"
          value={ammData.hasLiquidity ? "Active" : "Empty"}
          tone="primary"
        />
        <MiniStat label="Price" value={ammData.priceAinB} tone="primary" />
      </div>
    </SurfaceCard>
  );
}

function MiniStat({ label, value, tone = "neutral" }) {
  const color = {
    neutral: "text-[var(--text)]",
    success: "text-emerald-500",
    primary: "text-teal-500",
  }[tone];

  return (
    <div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`mt-1 truncate text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}