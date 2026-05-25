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
    <section className="hero-card relative overflow-hidden px-7 py-7 md:px-8 md:py-8">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-20 top-0 h-52 w-52 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* top row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            {badge ? (
              <div className="pro-chip mb-4">
                {icon ? <span>{icon}</span> : null}
                {badge}
              </div>
            ) : null}

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-[var(--text)] md:text-6xl">
              {title}{" "}
              {highlight ? (
                <span className="gradient-text">{highlight}</span>
              ) : null}
            </h1>

            {description ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
                {description}
              </p>
            ) : null}
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        {/* stats */}
        {stats.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="hero-stat rounded-2xl px-5 py-4"
              >
                <p className="text-xs font-bold text-[var(--muted)]">
                  {stat.label}
                </p>

                <p className="mt-2 text-lg font-black text-[var(--text)]">
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