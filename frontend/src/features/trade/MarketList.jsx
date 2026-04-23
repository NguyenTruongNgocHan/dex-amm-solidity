import Card from "../../components/common/Card";
import SectionTitle from "../../components/common/SectionTitle";

const markets = [
  { symbol: "TKA", name: "Token A", price: "1.0000", change: "+0.00%" },
  { symbol: "TKB", name: "Token B", price: "0.9093", change: "+0.00%" },
  { symbol: "LPT", name: "LP Token", price: "1.2040", change: "+0.00%" },
];

export default function MarketList() {
  return (
    <Card style={{ padding: 18, marginTop: 18 }}>
      <SectionTitle title="Markets" subtitle="3 tokens available" />

      <div style={{ display: "grid", gap: 10 }}>
        {markets.map((item, idx) => (
          <div
            key={item.symbol}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 10px",
              borderRadius: 14,
              background: idx === 0 ? "var(--color-primary-soft)" : "#F8FAFC",
              border:
                idx === 0
                  ? "1px solid var(--color-primary-border)"
                  : "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: idx === 0 ? "var(--color-primary)" : "#E2E8F0",
                  color: idx === 0 ? "white" : "var(--color-text)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {item.symbol[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{item.symbol}</div>
                <div style={{ color: "var(--color-muted)", fontSize: 13 }}>{item.name}</div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{item.price}</div>
              <div style={{ fontSize: 13, color: "var(--color-success)", fontWeight: 700 }}>
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}