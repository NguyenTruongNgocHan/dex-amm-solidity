import Card from "../../components/common/Card";
import SectionTitle from "../../components/common/SectionTitle";

const portfolioItems = [
  { symbol: "TKA", amount: "1,250.00", value: "$1,250.00" },
  { symbol: "TKB", amount: "920.50", value: "$920.50" },
  { symbol: "LPT", amount: "120.00", value: "$120.00" },
];

export default function PortfolioCard() {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle title="My Portfolio" />
        <div
          style={{
            background: "#FEF3C7",
            color: "#92400E",
            padding: "6px 10px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          $2,290.50
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {portfolioItems.map((item) => (
          <div
            key={item.symbol}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 10px",
              borderRadius: 14,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "var(--color-primary)",
                  color: "white",
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
                <div style={{ color: "var(--color-muted)", fontSize: 13 }}>{item.amount}</div>
              </div>
            </div>

            <div style={{ fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}