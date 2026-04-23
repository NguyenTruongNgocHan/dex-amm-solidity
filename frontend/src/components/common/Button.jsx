export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition";

  const styles = {
    primary:
      "bg-[var(--primary)] text-white border border-[var(--primary)] hover:opacity-90",
    secondary:
      "bg-[var(--surface)] text-[var(--primary-dark)] border border-[var(--primary-border)] hover:bg-[var(--primary-soft)]",
    ghost:
      "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-soft)]",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}