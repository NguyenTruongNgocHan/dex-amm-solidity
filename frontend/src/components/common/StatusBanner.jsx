import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function StatusBanner({
  type = "success",
  title = "",
  message,
  className = "",
}) {
  if (!message && !title) return null;

  const styles = {
    info: {
      icon: <Info size={15} />,
      className: "border-blue-400/20 bg-blue-500/10 text-blue-600 dark:text-blue-300",
    },
    success: {
      icon: <CheckCircle2 size={15} />,
      className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    },
    warning: {
      icon: <AlertCircle size={15} />,
      className: "border-amber-400/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    },
    danger: {
      icon: <AlertCircle size={15} />,
      className: "border-red-400/20 bg-red-500/10 text-red-600 dark:text-red-300",
    },
  }[type];

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold shadow-sm ${styles.className} ${className}`}
    >
      {styles.icon}
      <span className="truncate">
        {title ? `${title}: ` : ""}
        {message}
      </span>
    </div>
  );
}