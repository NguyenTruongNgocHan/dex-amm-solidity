import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

export default function HeroSection() {
  return (
    <Card
      style={{
        padding: "64px 32px",
        background:
          "linear-gradient(135deg, rgba(20,184,166,0.10), rgba(204,251,241,0.45))",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: 999,
            background: "white",
            color: "var(--color-primary-dark)",
            border: "1px solid var(--color-primary-border)",
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          Powered by Blockchain Technology
        </div>

        <h1
          style={{
            fontSize: 64,
            lineHeight: 1.05,
            margin: "0 0 18px",
            color: "var(--color-primary-dark)",
          }}
        >
          Decentralized AMM Trading Platform
        </h1>

        <p
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: "var(--color-text)",
            marginBottom: 28,
          }}
        >
          Trade tokens using an Automated Market Maker. Add liquidity, earn fees,
          and swap assets with transparent on-chain pricing.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Button>Start Trading</Button>
          <Button variant="secondary">Add Liquidity</Button>
        </div>
      </div>
    </Card>
  );
}