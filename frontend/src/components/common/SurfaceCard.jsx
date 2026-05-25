export default function SurfaceCard({
  children,
  className = "",
  hover = false,
  fill = false,
  scroll = false,
  minHeight,
  maxHeight,
  variant = "default",
}) {
  const style = { minHeight, maxHeight };

  const variants = {
    default: "surface-card",
    soft: "surface-card-soft",
    action: "dex-action-panel",
    panel: "dex-panel",
  };

  return (
    <section
      style={style}
      className={`${variants[variant] || variants.default} ${
        hover ? "card-hover" : ""
      } ${fill ? "h-full" : ""} ${scroll ? "scroll-panel" : ""} ${className}`}
    >
      {children}
    </section>
  );
}