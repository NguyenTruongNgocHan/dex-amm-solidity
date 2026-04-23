import Button from "../common/Button";

export default function Navbar() {
  return (
    <header
      style={{
        height: 76,
        background: "white",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--color-primary-dark)",
          }}
        >
          DEXCK
        </div>
        <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
          Decentralized Exchange based on AMM
        </div>
      </div>

      <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <a href="#">Home</a>
        <a href="#">Trade</a>
        <a href="#">Liquidity</a>
        <a href="#">Dashboard</a>
        <Button variant="secondary">Connect Wallet</Button>
      </nav>
    </header>
  );
}