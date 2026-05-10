export default function SurfaceCard({ children, className = "", hover = false }) {
  return (
    <div className={`surface-card ${hover ? "card-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}
