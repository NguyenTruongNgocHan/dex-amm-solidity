import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import SectionTitle from "../../components/common/SectionTitle";

export default function TradePanel() {
  return (
    <Card style={{ padding: 18 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <button
          style={{
            border: "1px solid var(--color-primary)",
            background: "var(--color-primary)",
            color: "white",
            borderRadius: 12,
            padding: "12px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Buy
        </button>
        <button
          style={{
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            color: "var(--color-text)",
            borderRadius: 12,
            padding: "12px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sell
        </button>
      </div>

      <SectionTitle title="Trade TokenA → TokenB" />

      <label style={{ display: "block", fontSize: 14, marginBottom: 8 }}>Amount to Spend</label>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          border: "1px solid #CBD5E1",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 14,
          background: "white",
        }}
      >
        <input
          defaultValue="100"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 26,
            fontWeight: 700,
            background: "transparent",
          }}
        />
        <div
          style={{
            background: "#F1F5F9",
            padding: "8px 12px",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          TKA
        </div>
      </div>

      <div
        style={{
          background: "var(--color-primary-soft)",
          border: "1px solid var(--color-primary-border)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 8 }}>
          You will receive
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: "var(--color-primary-dark)" }}>
          90.93 TKB
        </div>

        <InfoRow label="Price per token" value="1.1000 TKA" />
        <InfoRow label="Trading fee (0.3%)" value="0.300 TKA" />
        <InfoRow label="Price impact" value="9.07%" tone="warning" />
        <InfoRow label="Minimum received" value="90.02 TKB" tone="success" />
      </div>

      <label style={{ display: "block", fontSize: 14, marginBottom: 8 }}>
        Slippage Tolerance
      </label>

      <select
        defaultValue="1"
        style={{
          width: "100%",
          border: "1px solid #CBD5E1",
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 16,
          background: "white",
        }}
      >
        <option value="0.5">0.5%</option>
        <option value="1">1% - Recommended</option>
        <option value="2">2%</option>
        <option value="3">3%</option>
      </select>

      <Button fullWidth>Buy TokenB</Button>
    </Card>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneColor = {
    neutral: "var(--color-text)",
    warning: "#B45309",
    success: "#166534",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginTop: 10,
        fontSize: 14,
      }}
    >
      <span style={{ color: "var(--color-muted)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: toneColor[tone] }}>{value}</span>
    </div>
  );
}