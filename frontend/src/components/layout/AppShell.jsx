import Navbar from "./Navbar";

export default function AppShell({
  children,
  currentPage,
  onNavigate,
  walletAddress,
  onConnect,
}) {
  return (
    <div className="app-shell">
      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        walletAddress={walletAddress}
        onConnect={onConnect}
      />
      {children}
    </div>
  );
}