import { UploadCloud } from "lucide-react";
import Button from "../../../components/common/Button";

export default function IPFSActionCard({
  icon,
  title,
  tag,
  description,
  buttonText,
  onClick,
}) {
  return (
    <section className="dex-panel p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
          {icon}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--text)]">{title}</h3>
            <span className="dex-chip">{tag}</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>

      <Button className="mt-5 w-full" onClick={onClick}>
        <UploadCloud size={16} />
        {buttonText}
      </Button>
    </section>
  );
}