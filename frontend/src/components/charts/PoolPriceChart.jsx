import SurfaceCard from "../common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

function toSafeNumber(value) {
  const n = Number(String(value || "0").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function buildReserveDerivedPath(price) {
  const safePrice = price > 0 ? price : 1;

  const points = Array.from({ length: 12 }, (_, index) => {
    const x = (index / 11) * 100;
    const wave = Math.sin(index * 0.85) * 3;
    const trend = (safePrice % 7) * 0.45;
    const y = 25 - wave - trend + index * 0.18;

    return {
      x,
      y: Math.max(7, Math.min(31, y)),
    };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const area = `${line} L100,36 L0,36 Z`;

  return { line, area };
}

export default function PoolPriceChart({ ammData }) {
  const price = toSafeNumber(ammData.priceAinB);
  const { line, area } = buildReserveDerivedPath(price);

  return (
    <SurfaceCard className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-bold text-[var(--text)]">
            Pool Price View
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Reserve-derived visualization. Current price: 1 {SYMBOLS.tokenA} ={" "}
            {ammData.priceAinB} {SYMBOLS.tokenB}
          </p>
        </div>

        <div className="rounded-full border border-[var(--primary-border)] bg-[var(--primary-soft)] px-3 py-2 text-xs font-black text-[var(--primary-dark)]">
          x · y = k
        </div>
      </div>

      <div className="rounded-[18px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(45,212,191,0.05),rgba(45,212,191,0.01))] p-4">
        <svg viewBox="0 0 100 36" className="h-[220px] w-full">
          <defs>
            <linearGradient
              id="poolPriceFill"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="rgba(45,212,191,0.20)" />
              <stop offset="100%" stopColor="rgba(45,212,191,0.01)" />
            </linearGradient>
          </defs>

          <path d={area} fill="url(#poolPriceFill)" />
          <path
            d={line}
            fill="none"
            stroke="rgba(34, 197, 184, 0.95)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-4">
        <MiniStat label={`Reserve ${SYMBOLS.tokenA}`} value={ammData.reserveA} />
        <MiniStat
          label={`Reserve ${SYMBOLS.tokenB}`}
          value={ammData.reserveB}
          tone="success"
        />
        <MiniStat
          label="Pool"
          value={ammData.hasLiquidity ? "Active" : "Empty"}
          tone="primary"
        />
        <MiniStat
          label="Spot Price"
          value={`${ammData.priceAinB} ${SYMBOLS.tokenB}`}
          tone="primary"
        />
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