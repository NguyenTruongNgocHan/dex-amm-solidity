import Card from "../../components/common/Card";

const items = [
  {
    title: "AMM Trading",
    desc: "Swap tokens using the constant product formula x*y=k with transparent pricing.",
  },
  {
    title: "Liquidity Pool",
    desc: "Provide liquidity to pools and receive LP tokens representing your share.",
  },
  {
    title: "Non-custodial",
    desc: "Your funds stay in your wallet. No centralized custody.",
  },
];

export default function FeatureGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 20,
        marginTop: 24,
      }}
    >
      {items.map((item) => (
        <Card key={item.title} style={{ padding: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--color-primary-soft)",
              marginBottom: 18,
            }}
          />
          <h3 style={{ margin: "0 0 10px" }}>{item.title}</h3>
          <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.6 }}>
            {item.desc}
          </p>
        </Card>
      ))}
    </div>
  );
}