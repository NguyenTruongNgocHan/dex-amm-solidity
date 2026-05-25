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
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
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