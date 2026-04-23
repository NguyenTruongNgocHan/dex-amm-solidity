import Navbar from "./Navbar";

export default function AppShell({ children, currentPage, onNavigate }) {
  return (
    <div className="app-shell">
      <Navbar currentPage={currentPage} onNavigate={onNavigate} />
      {children}
    </div>
  );
}