import Card from "../common/Card";
import SectionTitle from "../common/SectionTitle";

export default function PriceChartPlaceholder() {
  return (
    <Card style={{ padding: 22, minHeight: 420 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <SectionTitle
          title="Token Price History"
          subtitle="Real-time price tracking"
        />

        <div style={{ display: "flex", gap: 8 }}>
          {["1H", "24H", "7D", "30D"].map((item, idx) => (
            <button
              key={item}
              style={{
                border: idx === 1 ? "1px solid var(--color-primary)" : "1px solid #E2E8F0",
                background: idx === 1 ? "var(--color-primary)" : "white",
                color: idx === 1 ? "white" : "var(--color-text)",
                borderRadius: 10,
                padding: "8px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: 260,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, rgba(20,184,166,0.10), rgba(20,184,166,0.03))",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="tealFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(20,184,166,0.30)" />
              <stop offset="100%" stopColor="rgba(20,184,166,0.02)" />
            </linearGradient>
          </defs>
          <path
            d="M0,28 C10,24 18,18 30,14 C42,10 54,8 66,16 C76,23 86,31 100,38 L100,40 L0,40 Z"
            fill="url(#tealFill)"
          />
          <path
            d="M0,28 C10,24 18,18 30,14 C42,10 54,8 66,16 C76,23 86,31 100,38"
            fill="none"
            stroke="#14B8A6"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
          marginTop: 18,
        }}
      >
        <MiniStat label="Current Price" value="$6.5492" tone="neutral" />
        <MiniStat label="24h High" value="$6.6474" tone="success" />
        <MiniStat label="24h Low" value="$6.4509" tone="danger" />
        <MiniStat label="24h Volume" value="$95.2K" tone="primary" />
      </div>
    </Card>
  );
}

function MiniStat({ label, value, tone }) {
  const colorMap = {
    neutral: "var(--color-text)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
    primary: "var(--color-primary-dark)",
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: colorMap[tone] }}>{value}</div>
    </div>
  );
}