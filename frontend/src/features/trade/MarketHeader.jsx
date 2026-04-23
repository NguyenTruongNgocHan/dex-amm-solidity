import Card from "../../components/common/Card";
import StatPill from "../../components/common/StatPill";

export default function MarketHeader() {
  return (
    <Card style={{ padding: 22, marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "var(--color-primary)",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            A
          </div>

          <div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>TokenA</div>
            <div style={{ color: "var(--color-muted)", marginTop: 4 }}>
              Core AMM trading asset
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>$1.0000</div>
          <div style={{ marginTop: 10 }}>
            <StatPill label="24h" value="+0.00%" tone="success" />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
          marginTop: 20,
          paddingTop: 18,
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <HeaderStat label="Current Price" value="$1.0000" tone="neutral" />
        <HeaderStat label="24h High" value="$1.0150" tone="success" />
        <HeaderStat label="24h Low" value="$0.9850" tone="danger" />
        <HeaderStat label="Liquidity" value="$12.4K" tone="primary" />
      </div>
    </Card>
  );
}

function HeaderStat({ label, value, tone }) {
  const colors = {
    neutral: "var(--color-text)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
    primary: "var(--color-primary-dark)",
  };

  return (
    <div>
      <div style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 8 }}>{label}</div>
      <div style={{ fontWeight: 800, color: colors[tone], fontSize: 24 }}>{value}</div>
    </div>
  );
}