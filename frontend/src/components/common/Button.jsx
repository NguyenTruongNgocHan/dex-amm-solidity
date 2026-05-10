export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-55";

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3.5 text-base",
  };

  const styles = {
    primary:
      "border border-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/25",
    secondary:
      "border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)] hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]",
    ghost:
      "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:-translate-y-0.5 hover:bg-[var(--surface-soft)]",
    danger:
      "border border-red-200 bg-red-50 text-red-600 hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    dark:
      "border border-slate-800 bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white/10",
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
