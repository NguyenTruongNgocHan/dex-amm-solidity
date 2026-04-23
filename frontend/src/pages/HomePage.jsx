import AppShell from "../components/layout/AppShell";
import HeroSection from "../features/home/HeroSection";
import FeatureGrid from "../features/home/FeatureGrid";

export default function HomePage() {
  return (
    <AppShell>
      <HeroSection />
      <FeatureGrid />
    </AppShell>
  );
}