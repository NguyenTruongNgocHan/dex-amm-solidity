export default function TokenAmountInput({
  label,
  value,
  onChange,
  symbol,
  helper,
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text)]">
        {label}
      </label>

      <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition focus-within:border-[var(--primary)]">
        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readOnly}
            className="w-full bg-transparent text-[28px] font-bold leading-none text-[var(--text)] outline-none"
            placeholder="0.0"
          />

          <div className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold text-[var(--text)]">
            {symbol}
          </div>
        </div>
      </div>

      {helper ? (
        <p className="mt-2 text-xs text-[var(--muted)]">{helper}</p>
      ) : null}
    </div>
  );
}