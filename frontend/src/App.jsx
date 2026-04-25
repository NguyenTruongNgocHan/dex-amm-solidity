import { useState } from "react";
import HomePage from "./pages/HomePage";
import TradePage from "./pages/TradePage";
import LiquidityPage from "./pages/LiquidityPage";
import useWallet from "./hooks/useWallet";

function App() {
  const [page, setPage] = useState("home");
  const wallet = useWallet();

  const commonProps = {
    onNavigate: setPage,
    wallet,
  };

  if (page === "trade") return <TradePage {...commonProps} />;
  if (page === "liquidity") return <LiquidityPage {...commonProps} />;

  return <HomePage {...commonProps} />;
}

export default App;