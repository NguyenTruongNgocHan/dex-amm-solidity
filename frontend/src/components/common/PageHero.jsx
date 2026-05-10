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
    <section className="surface-card-soft px-6 py-7 md:px-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          {badge ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary-border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black text-[var(--primary-dark)] shadow-sm">
              {icon ? <span>{icon}</span> : null}
              {badge}
            </div>
          ) : null}

          <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-5xl">
            {title} {highlight ? <span className="gradient-text">{highlight}</span> : null}
          </h1>

          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {stats.length ? (
        <div className="relative mt-6 grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm"
            >
              <p className="text-xs font-semibold text-[var(--muted)]">{stat.label}</p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
