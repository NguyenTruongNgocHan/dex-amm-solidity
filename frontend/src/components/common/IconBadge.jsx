export default function IconBadge({
  children,
  tone = "primary",
  className = "",
}) {
  const tones = {
    primary: "bg-[var(--primary)] text-white",
    soft: "bg-[var(--primary-soft)] text-[var(--primary-dark)]",
    blue: "bg-blue-600 text-white",
    violet: "bg-violet-600 text-white",
    neutral:
      "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}