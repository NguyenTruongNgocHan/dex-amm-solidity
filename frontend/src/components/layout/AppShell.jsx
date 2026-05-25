import Navbar from "./Navbar";

export default function AppShell({
  children,
  currentPage,
  onNavigate,
  walletAddress = "",
  onConnect,
  wallet = null,
}) {
  return (
    <div className="production-shell text-[var(--text)]">
      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        walletAddress={walletAddress}
        onConnect={onConnect}
        wallet={wallet}
      />
      {children}
    </div>
  );
}