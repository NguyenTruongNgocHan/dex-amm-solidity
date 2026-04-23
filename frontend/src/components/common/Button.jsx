export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  ...props
}) {
  const styles = {
    primary: {
      background: "var(--color-primary)",
      color: "white",
      border: "1px solid var(--color-primary)",
    },
    secondary: {
      background: "white",
      color: "var(--color-primary-dark)",
      border: "1px solid var(--color-primary-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text)",
      border: "1px solid #E2E8F0",
    },
  };

  return (
    <button
      {...props}
      style={{
        ...styles[variant],
        width: fullWidth ? "100%" : "auto",
        borderRadius: "14px",
        padding: "12px 18px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}