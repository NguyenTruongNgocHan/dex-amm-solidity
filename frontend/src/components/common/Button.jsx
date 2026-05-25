export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-black transition duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-55";

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3.5 text-base",
  };

  const styles = {
    primary:
      "border border-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 hover:shadow-xl",
    secondary:
      "border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)] hover:-translate-y-0.5",
    ghost:
      "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] hover:-translate-y-0.5 hover:border-[var(--primary-border)]",
    danger:
      "border border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)] hover:-translate-y-0.5",
    success:
      "border border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)] hover:-translate-y-0.5",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}