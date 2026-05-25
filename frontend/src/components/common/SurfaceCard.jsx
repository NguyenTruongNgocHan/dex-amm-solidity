export default function SurfaceCard({
  children,
  className = "",
  hover = false,
  fill = false,
  scroll = false,
  minHeight,
  maxHeight,
}) {
  const style = {
    minHeight,
    maxHeight,
  };

  return (
    <div
      style={style}
      className={`surface-card ${hover ? "card-hover" : ""} ${
        fill ? "ui-card-fill" : ""
      } ${scroll ? "ui-scroll" : ""} ${className}`}
    >
      {children}
    </div>
  );
}