import AppShell from "../components/layout/AppShell";
import HeroSection from "../features/home/HeroSection";
import FeatureGrid from "../features/home/FeatureGrid";

export default function HomePage({ onNavigate }) {
  return (
    <AppShell currentPage="home" onNavigate={onNavigate}>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <HeroSection onNavigate={onNavigate} />
        <FeatureGrid />
      </main>
    </AppShell>
  );
}