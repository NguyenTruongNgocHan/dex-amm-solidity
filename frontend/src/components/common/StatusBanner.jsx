import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function StatusBanner({
  type = "success",
  title = "",
  message,
  className = "",
}) {
  if (!message && !title) return null;

  const map = {
    info: {
      icon: <Info size={15} />,
      cls: "border-[var(--blue-border)] bg-[var(--blue-soft)] text-[var(--blue)]",
    },
    success: {
      icon: <CheckCircle2 size={15} />,
      cls: "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
    },
    warning: {
      icon: <AlertCircle size={15} />,
      cls: "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
    },
    danger: {
      icon: <AlertCircle size={15} />,
      cls: "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
    },
  };

  const style = map[type] || map.info;

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${style.cls} ${className}`}
    >
      {style.icon}
      <span className="truncate">
        {title ? `${title}: ` : ""}
        {message}
      </span>
    </div>
  );
}