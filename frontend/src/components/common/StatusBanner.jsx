import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function StatusBanner({
  type = "info",
  title = "",
  message,
  className = "",
}) {
  if (!message && !title) return null;

  const styles = {
    info: {
      icon: <Info size={17} />,
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
    },
    success: {
      icon: <CheckCircle2 size={17} />,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    warning: {
      icon: <AlertCircle size={17} />,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    },
    danger: {
      icon: <AlertCircle size={17} />,
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    },
  }[type] ?? styles.info;

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${styles.className} ${className}`}
    >
      <span className="mt-0.5 shrink-0">{styles.icon}</span>
      <div>
        {title ? <div className="font-black">{title}</div> : null}
        {message ? <div className="mt-1 leading-6">{message}</div> : null}
      </div>
    </div>
  );
}