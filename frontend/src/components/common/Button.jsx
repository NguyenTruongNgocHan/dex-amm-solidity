export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition";

  const styles = {
    primary:
      "bg-[var(--primary)] text-white border border-[var(--primary)] hover:opacity-90",
    secondary:
      "bg-white text-[var(--primary-dark)] border border-[var(--primary-border)] hover:bg-[var(--primary-soft)] dark:bg-[var(--surface)]",
    ghost:
      "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-soft)]",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}