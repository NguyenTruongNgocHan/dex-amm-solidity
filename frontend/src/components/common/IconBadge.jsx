export default function IconBadge({
  children,
  tone = "primary",
  className = "",
}) {
  const tones = {
    primary:
      "bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/25",
    soft: "bg-[var(--primary-soft)] text-[var(--primary-dark)] border border-[var(--primary-border)]",
    blue: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    violet: "bg-violet-500 text-white shadow-lg shadow-violet-500/20",
    pink: "bg-pink-500 text-white shadow-lg shadow-pink-500/20",
    amber: "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20",
    success: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    neutral:
      "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
