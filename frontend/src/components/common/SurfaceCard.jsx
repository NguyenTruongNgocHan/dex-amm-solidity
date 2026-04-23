export default function SurfaceCard({ children, className = "" }) {
  return <div className={`surface-card ${className}`}>{children}</div>;
}