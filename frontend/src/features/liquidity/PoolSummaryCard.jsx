import SurfaceCard from "../../components/common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

export default function PoolSummaryCard({ ammData }) {
  return (
    <SurfaceCard className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-cyan-500/20">
          💧
        </div>

        <div>
          <h3 className="text-lg font-bold text-[var(--text)]">Pool Summary</h3>
          <p className="text-sm text-[var(--muted)]">
            {SYMBOLS.tokenA} / {SYMBOLS.tokenB} AMM pool
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <InfoRow
          label={`Reserve ${SYMBOLS.tokenA}`}
          value={`${ammData.reserveA} ${SYMBOLS.tokenA}`}
        />
        <InfoRow
          label={`Reserve ${SYMBOLS.tokenB}`}
          value={`${ammData.reserveB} ${SYMBOLS.tokenB}`}
        />
        <InfoRow
          label={`Price ${SYMBOLS.tokenA} → ${SYMBOLS.tokenB}`}
          value={`${ammData.priceAinB} ${SYMBOLS.tokenB}`}
        />
        <InfoRow
          label="Status"
          value={ammData.hasLiquidity ? "Active" : "Empty"}
          tone={ammData.hasLiquidity ? "success" : "warning"}
        />
      </div>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "success"
      ? "text-emerald-400"
      : tone === "warning"
      ? "text-amber-400"
      : "text-[var(--text)]";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`max-w-[170px] truncate text-right font-bold ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}