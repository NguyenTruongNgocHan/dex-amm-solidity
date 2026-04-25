import { useState } from "react";
import HomePage from "./pages/HomePage";
import TradePage from "./pages/TradePage";
import LiquidityPage from "./pages/LiquidityPage";
import DashboardPage from "./pages/DashboardPage";
import useWallet from "./hooks/useWallet";

function App() {
  const [page, setPage] = useState("home");
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const wallet = useWallet();

  function refreshActivity() {
    setActivityRefreshKey((prev) => prev + 1);
  }

  const commonProps = {
    onNavigate: setPage,
    wallet,
    activityRefreshKey,
    refreshActivity,
  };

  if (page === "trade") return <TradePage {...commonProps} />;
  if (page === "liquidity") return <LiquidityPage {...commonProps} />;
  if (page === "dashboard") return <DashboardPage {...commonProps} />;

  return <HomePage {...commonProps} />;
}

export default App;