export default function PageHero({
  badge,
  title,
  highlight,
  description,
  icon,
  action,
  stats = [],
}) {
  return (
    <section className="hero-card px-6 py-7 md:px-8">
      <div className="relative z-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            {badge ? (
              <div className="dex-chip mb-4">
                {icon ? <span>{icon}</span> : null}
                {badge}
              </div>
            ) : null}

            <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.03] tracking-tight text-[var(--text)] md:text-5xl">
              {title}{" "}
              {highlight ? (
                <span className="gradient-text">{highlight}</span>
              ) : null}
            </h1>

            {description ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {description}
              </p>
            ) : null}
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        {stats.length ? (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat px-5 py-4">
                <p className="truncate text-xs font-black uppercase tracking-wide text-[var(--muted)]">
                  {stat.label}
                </p>
                <p className="mt-2 truncate text-lg font-black text-[var(--text)]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}