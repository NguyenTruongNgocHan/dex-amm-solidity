import Navbar from "./Navbar";
import PageContainer from "./PageContainer";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}