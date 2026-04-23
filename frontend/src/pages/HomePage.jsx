import AppShell from "../components/layout/AppShell";
import FeatureGrid from "../features/home/FeatureGrid";
import HeroSection from "../features/home/HeroSection";

export default function HomePage() {
  return (
    <AppShell>
      <HeroSection />
      <FeatureGrid />
    </AppShell>
  );
}