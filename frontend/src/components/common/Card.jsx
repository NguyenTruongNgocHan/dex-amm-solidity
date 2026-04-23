export default function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid #E2E8F0",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-soft)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}