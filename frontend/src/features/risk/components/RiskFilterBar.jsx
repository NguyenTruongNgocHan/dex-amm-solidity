import { Search, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button";

const filters = ["All", "Normal", "Warning", "Suspicious"];

export default function RiskFilterBar({
  query,
  setQuery,
  filter,
  setFilter,
  onClearFailed,
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full border px-4 py-2 text-xs font-black transition ${
              filter === item
                ? "border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex h-11 min-w-[320px] items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3">
          <Search size={16} className="text-[var(--muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tx, actor, reason..."
            className="w-full bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>

        <Button variant="ghost" onClick={onClearFailed}>
          <Trash2 size={15} />
          Clear Failed Logs
        </Button>
      </div>
    </div>
  );
}