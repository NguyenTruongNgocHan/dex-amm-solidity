import { useMemo, useState } from "react";
import { BarChart3, CandlestickChart, Droplets } from "lucide-react";
import SurfaceCard from "../common/SurfaceCard";
import { SYMBOLS } from "../../config/contracts";

const metrics = [
  { key: "price", label: "Price", icon: <CandlestickChart size={13} /> },
  { key: "liquidity", label: "Liquidity", icon: <Droplets size={13} /> },
  { key: "volume", label: "Volume", icon: <BarChart3 size={13} /> },
];

const timeframes = ["1H", "24H", "7D"];

function toNumber(value) {
  const n = Number(String(value || "0").replaceAll(",", "").split(" ")[0]);
  return Number.isFinite(n) ? n : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildSmoothPath(points) {
  if (points.length === 0) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const midX = (previous.x + current.x) / 2;

    path += ` C ${midX} ${previous.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
}

function normalizeSeries(rawPoints) {
  if (rawPoints.length === 0) return [];

  if (rawPoints.length === 1) {
    return [
      {
        ...rawPoints[0],
        x: 50,
        y: 18,
      },
    ];
  }

  const values = rawPoints.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(max, 1);

  return rawPoints.map((point, index) => ({
    ...point,
    x: 4 + (index / (rawPoints.length - 1)) * 92,
    y: 6 + ((max - point.value) / range) * 24,
  }));
}

function timeframeWindowMs(timeframe) {
  if (timeframe === "1H") return 60 * 60 * 1000;
  if (timeframe === "24H") return 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}

function eventTimestamp(event, index) {
  if (event.createdAt) {
    const parsed = Date.parse(event.createdAt);
    if (Number.isFinite(parsed)) return parsed;
  }

  if (event.blockNumber) {
    return Number(event.blockNumber) * 1000;
  }

  return index;
}

function filterByTimeframe(events, timeframe) {
  if (!events.length) return [];

  const windowMs = timeframeWindowMs(timeframe);
  const now = Date.now();

  const withTime = events.map((event, index) => ({
    ...event,
    _timestamp: eventTimestamp(event, index),
  }));

  const recent = withTime.filter((event) => {
    if (event.createdAt) return now - event._timestamp <= windowMs;
    return true;
  });

  return recent.length ? recent : withTime;
}

function buildPriceSeries(events, ammData, timeframe) {
  const filtered = filterByTimeframe(events, timeframe);

  const swaps = filtered
    .filter((event) => event.type === "SWAP")
    .map((event, index) => {
      const amountIn = event.amountInNumber || toNumber(event.primary);
      const amountOut = event.amountOutNumber || toNumber(event.secondary);

      if (amountIn <= 0 || amountOut <= 0) return null;

      const isAtoB =
        event.tokenInSymbol === SYMBOLS.tokenA ||
        String(event.primary || "").includes(SYMBOLS.tokenA);

      const price = isAtoB ? amountOut / amountIn : amountIn / amountOut;

      return {
        value: price,
        label: `Swap #${event.blockNumber || index + 1}`,
        eventType: "SWAP",
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      };
    })
    .filter(Boolean);

  if (swaps.length > 0) {
    return normalizeSeries(swaps);
  }

  const currentPrice = toNumber(ammData.priceAinB);

  if (currentPrice > 0) {
    return normalizeSeries([
      {
        value: currentPrice,
        label: "Current spot price",
        eventType: "SPOT",
        txHash: "",
        blockNumber: "",
      },
    ]);
  }

  return [];
}

function buildLiquiditySeries(events, ammData, timeframe) {
  const reserveA = toNumber(ammData.reserveA);
  const reserveB = toNumber(ammData.reserveB);
  const currentDepth = reserveA + reserveB;

  const filtered = filterByTimeframe(events, timeframe);
  const liquidityEvents = filtered.filter((event) =>
    ["ADD", "REMOVE"].includes(event.type)
  );

  if (liquidityEvents.length === 0) {
    return currentDepth > 0
      ? normalizeSeries([
          {
            value: currentDepth,
            label: "Current pool depth",
            eventType: "POOL",
            txHash: "",
            blockNumber: "",
          },
        ])
      : [];
  }

  let runningDepth = currentDepth;

  const reversed = [...liquidityEvents].reverse();

  const points = reversed.map((event) => {
    const amountA = event.amountInNumber || toNumber(event.primary);
    const amountB = event.amountOutNumber || toNumber(event.secondary);
    const moved = amountA + amountB;

    if (event.type === "ADD") {
      runningDepth = Math.max(0, runningDepth - moved);
      const afterAdd = runningDepth + moved;
      runningDepth = afterAdd;

      return {
        value: afterAdd,
        label: `Add liquidity #${event.blockNumber}`,
        eventType: "ADD",
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      };
    }

    const afterRemove = Math.max(0, runningDepth - moved);
    runningDepth = afterRemove;

    return {
      value: afterRemove,
      label: `Remove liquidity #${event.blockNumber}`,
      eventType: "REMOVE",
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    };
  });

  return normalizeSeries(points);
}

function buildVolumeSeries(events, timeframe) {
  const filtered = filterByTimeframe(events, timeframe);
  const swaps = filtered.filter((event) => event.type === "SWAP");

  if (swaps.length === 0) return [];

  const points = swaps.map((event) => {
    const amountIn = event.amountInNumber || toNumber(event.primary);

    return {
      value: amountIn,
      label: `Swap volume #${event.blockNumber}`,
      eventType: "SWAP",
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    };
  });

  return normalizeSeries(points);
}

function buildSeries({ metric, timeframe, ammData, activity }) {
  const events = activity?.allEvents || [];

  if (metric === "liquidity") {
    return buildLiquiditySeries(events, ammData, timeframe);
  }

  if (metric === "volume") {
    return buildVolumeSeries(events, timeframe);
  }

  return buildPriceSeries(events, ammData, timeframe);
}

function formatValue(value, metric) {
  if (metric === "price") return `${value.toFixed(5)} ${SYMBOLS.tokenB}`;
  if (metric === "liquidity") {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })} volume`;
}

function getMetricStats(series, metric) {
  if (series.length === 0) {
    return {
      last: "N/A",
      high: "N/A",
      low: "N/A",
      change: 0,
    };
  }

  const first = series[0]?.value || 0;
  const last = series[series.length - 1]?.value || 0;
  const high = Math.max(...series.map((item) => item.value));
  const low = Math.min(...series.map((item) => item.value));
  const change = first > 0 ? ((last - first) / first) * 100 : 0;

  return {
    last: formatValue(last, metric),
    high: formatValue(high, metric),
    low: formatValue(low, metric),
    change,
  };
}

function getMarkers(series) {
  return series
    .filter((point) => ["SWAP", "ADD", "REMOVE"].includes(point.eventType))
    .slice(-8);
}

function markerColor(type) {
  if (type === "SWAP") return "rgba(59,130,246,0.95)";
  if (type === "ADD") return "rgba(16,185,129,0.95)";
  if (type === "REMOVE") return "rgba(239,68,68,0.95)";
  return "rgba(20,184,166,0.95)";
}

export default function PoolPriceChart({ ammData, activity }) {
  const [metric, setMetric] = useState("price");
  const [timeframe, setTimeframe] = useState("24H");
  const [hoverIndex, setHoverIndex] = useState(null);

  const series = useMemo(
    () => buildSeries({ metric, timeframe, ammData, activity }),
    [metric, timeframe, ammData, activity]
  );

  const stats = useMemo(() => getMetricStats(series, metric), [series, metric]);
  const markers = useMemo(() => getMarkers(series), [series]);

  const line = buildSmoothPath(series);
  const area = line ? `${line} L 96 34 L 4 34 Z` : "";
  const activePoint =
    series.length === 0
      ? null
      : hoverIndex === null
      ? series[series.length - 1]
      : series[hoverIndex];

  function handleMouseMove(event) {
    if (series.length <= 1) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const index = Math.round(((x - 4) / 92) * (series.length - 1));

    setHoverIndex(clamp(index, 0, series.length - 1));
  }

  const poolDepth =
    toNumber(ammData.reserveA) + toNumber(ammData.reserveB);

  return (
    <SurfaceCard className="p-5">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[18px] font-black text-[var(--text)]">
              Market Analytics
            </h3>
            <span className="dex-chip">On-chain Events</span>
            <span className="dex-chip dex-chip-success">No Mock Data</span>
          </div>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Market view derived from AMM reserves and emitted protocol events.
            Hover the curve to inspect concrete on-chain values.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {timeframes.map((item) => (
            <button
              key={item}
              onClick={() => setTimeframe(item)}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                timeframe === item
                  ? "border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                  : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {metrics.map((item) => (
          <button
            key={item.key}
            onClick={() => setMetric(item.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${
              metric === item.key
                ? "border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--border)] bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.13),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.03),rgba(45,212,191,0.03))] p-4">
        <div className="mb-3 grid grid-cols-4 gap-3">
          <Mini label="Current" value={stats.last} strong />
          <Mini
            label="Change"
            value={`${stats.change >= 0 ? "+" : ""}${stats.change.toFixed(2)}%`}
            tone={stats.change >= 0 ? "up" : "down"}
          />
          <Mini label="High" value={stats.high} />
          <Mini label="Low" value={stats.low} />
        </div>

        <div
          className="relative rounded-[18px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {series.length === 0 ? (
            <div className="grid h-[220px] place-items-center text-center">
              <div>
                <div className="font-black text-[var(--text)]">
                  No on-chain {metric} events yet
                </div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  Perform swaps or liquidity actions to populate this chart.
                </div>
              </div>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 100 36" className="h-[220px] w-full">
                <defs>
                  <linearGradient id="marketLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgba(20,184,166,0.95)" />
                    <stop offset="55%" stopColor="rgba(59,130,246,0.95)" />
                    <stop offset="100%" stopColor="rgba(168,85,247,0.95)" />
                  </linearGradient>

                  <linearGradient id="marketFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(45,212,191,0.16)" />
                    <stop offset="100%" stopColor="rgba(45,212,191,0.01)" />
                  </linearGradient>
                </defs>

                {[10, 18, 26, 34].map((y) => (
                  <line
                    key={y}
                    x1="4"
                    x2="96"
                    y1={y}
                    y2={y}
                    stroke="rgba(100,116,139,0.18)"
                    strokeWidth="0.25"
                  />
                ))}

                {series.length > 1 ? <path d={area} fill="url(#marketFill)" /> : null}

                {series.length > 1 ? (
                  <path
                    d={line}
                    fill="none"
                    stroke="url(#marketLine)"
                    strokeWidth="0.58"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <line
                    x1="12"
                    x2="88"
                    y1={series[0].y}
                    y2={series[0].y}
                    stroke="url(#marketLine)"
                    strokeWidth="0.58"
                    strokeLinecap="round"
                  />
                )}

                {markers.map((marker) => (
                  <circle
                    key={`${marker.txHash}-${marker.eventType}-${marker.blockNumber}`}
                    cx={marker.x}
                    cy={marker.y}
                    r="0.9"
                    fill={markerColor(marker.eventType)}
                  />
                ))}

                {activePoint ? (
                  <>
                    <line
                      x1={activePoint.x}
                      x2={activePoint.x}
                      y1="5"
                      y2="34"
                      stroke="rgba(148,163,184,0.45)"
                      strokeWidth="0.35"
                      strokeDasharray="1.2 1.2"
                    />
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.y}
                      r="1.35"
                      fill="white"
                      stroke="rgba(20,184,166,0.95)"
                      strokeWidth="0.7"
                    />
                  </>
                ) : null}
              </svg>

              {activePoint ? (
                <div
                  className="pointer-events-none absolute top-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
                  style={{
                    left: `${clamp(activePoint.x, 12, 76)}%`,
                  }}
                >
                  <div className="font-black text-[var(--text)]">
                    {formatValue(activePoint.value, metric)}
                  </div>
                  <div className="mt-1 font-semibold text-[var(--muted)]">
                    {activePoint.label}
                  </div>
                  {activePoint.blockNumber ? (
                    <div className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                      Block #{activePoint.blockNumber}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
          <div className="flex flex-wrap items-center gap-3">
            <LegendDot label="Swap" color="bg-blue-500" />
            <LegendDot label="Add LP" color="bg-emerald-500" />
            <LegendDot label="Remove LP" color="bg-red-500" />
          </div>

          <div>
            Pool depth:{" "}
            <span className="font-black text-[var(--text)]">
              {poolDepth.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function Mini({ label, value, strong = false, tone = "neutral" }) {
  const color =
    tone === "up"
      ? "text-emerald-500"
      : tone === "down"
      ? "text-red-500"
      : strong
      ? "text-[var(--text)]"
      : "text-[var(--muted)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className={`mt-1 truncate text-sm font-black ${color}`}>{value}</div>
    </div>
  );
}

function LegendDot({ label, color }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}