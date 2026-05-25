export default function ForensicTimeline({ items }) {
  return (
    <section className="dex-panel p-5">
      <div>
        <div className="dex-chip">Forensic Timeline</div>
        <h3 className="mt-3 text-xl font-black text-[var(--text)]">
          Evidence Timeline
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Chronological view of swaps, liquidity events, evidence anchors, and
          failed attempts.
        </p>
      </div>

      <div className="scroll-panel mt-5 grid max-h-[560px] gap-3 overflow-auto pr-2">
        {items.length === 0 ? (
          <div className="empty-state min-h-[180px]">
            No forensic timeline data yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="dex-chip">{item.type}</span>
                <span className="dex-chip">{item.source}</span>
              </div>

              <div className="mt-3 font-black text-[var(--text)]">
                {item.title}
              </div>

              <div className="mt-1 text-sm font-semibold text-[var(--muted)]">
                Actor: {item.actor || "Unknown"} · Block{" "}
                {item.blockNumber || "N/A"}
              </div>

              <div className="mt-2 break-all font-mono text-xs text-[var(--muted)]">
                {item.txHash}
              </div>

              <div className="mt-2 text-sm text-[var(--muted)]">
                {item.description}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}