import Card from "../../components/common/Card";
import SectionTitle from "../../components/common/SectionTitle";

const trades = [
  { side: "BUY", symbol: "TKB", time: "01:36 PM", qty: "90.93", value: "100 TKA" },
  { side: "SELL", symbol: "TKA", time: "01:20 PM", qty: "50.00", value: "54.95 TKB" },
];

export default function RecentTrades() {
  return (
    <Card style={{ padding: 18, marginTop: 16 }}>
      <SectionTitle title="Recent Trades" />

      <div style={{ display: "grid", gap: 12 }}>
        {trades.map((trade, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 10px",
              borderRadius: 14,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{trade.symbol}</div>
              <div style={{ color: "var(--color-muted)", fontSize: 13 }}>{trade.time}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: trade.side === "BUY" ? "#DCFCE7" : "#FEE2E2",
                  color: trade.side === "BUY" ? "#166534" : "#B91C1C",
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                {trade.side}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
                {trade.qty} → {trade.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}