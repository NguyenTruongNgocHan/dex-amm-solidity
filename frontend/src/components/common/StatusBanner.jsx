import { AlertCircle, CheckCircle2, Info } from "lucide-react";

function getTone(message = "") {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("reject") ||
    normalized.includes("reverted") ||
    normalized.includes("insufficient")
  ) {
    return "danger";
  }

  if (
    normalized.includes("successful") ||
    normalized.includes("connected") ||
    normalized.includes("saved")
  ) {
    return "success";
  }

  return "info";
}

export default function StatusBanner({ message, className = "" }) {
  if (!message) return null;

  const tone = getTone(message);

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
    danger: {
      icon: <AlertCircle size={17} />,
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    },
  }[tone];

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${styles.className} ${className}`}
    >
      <span className="mt-0.5 shrink-0">{styles.icon}</span>
      <span className="leading-6">{message}</span>
    </div>
  );
}
