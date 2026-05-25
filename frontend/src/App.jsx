import { useEffect, useMemo, useState } from "react";
import HomePage from "./pages/HomePage";
import TradePage from "./pages/TradePage";
import LiquidityPage from "./pages/LiquidityPage";
import DashboardPage from "./pages/DashboardPage";
import FarmPage from "./pages/FarmPage";
import AdminPage from "./pages/AdminPage";
import AccessRequestPage from "./pages/AccessRequestPage";
import EvidencePage from "./pages/EvidencePage";
import useWallet from "./hooks/useWallet";

const PATH_TO_PAGE = {
  "/": "home",
  "/trade": "trade",
  "/liquidity": "liquidity",
  "/farm": "farm",
  "/dashboard": "dashboard",
  "/evidence": "evidence",
  "/access": "access",
  "/admin": "admin",
};

const PAGE_TO_PATH = {
  home: "/",
  trade: "/trade",
  liquidity: "/liquidity",
  farm: "/farm",
  dashboard: "/dashboard",
  evidence: "/evidence",
  access: "/access",
  admin: "/admin",
};

function getPageFromPath() {
  return PATH_TO_PAGE[window.location.pathname] || "home";
}

function App() {
  const [page, setPage] = useState(getPageFromPath);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const wallet = useWallet();

  useEffect(() => {
    function handlePopState() {
      setPage(getPageFromPath());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(nextPage) {
    const nextPath = PAGE_TO_PATH[nextPage] || "/";

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }

    setPage(nextPage);
  }

  function refreshActivity() {
    setActivityRefreshKey((prev) => prev + 1);
  }

  const commonProps = useMemo(
    () => ({
      onNavigate: navigate,
      wallet,
      activityRefreshKey,
      refreshActivity,
    }),
    [wallet, activityRefreshKey]
  );

  if (page === "trade") return <TradePage {...commonProps} />;
  if (page === "liquidity") return <LiquidityPage {...commonProps} />;
  if (page === "farm") return <FarmPage {...commonProps} />;
  if (page === "dashboard") return <DashboardPage {...commonProps} />;
  if (page === "evidence") return <EvidencePage {...commonProps} />;
  if (page === "admin") return <AdminPage {...commonProps} />;
  if (page === "access") return <AccessRequestPage {...commonProps} />;

  return <HomePage {...commonProps} />;
}

export default App;