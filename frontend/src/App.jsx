import { useState } from "react";
import HomePage from "./pages/HomePage";
import TradePage from "./pages/TradePage";
import useWallet from "./hooks/useWallet";

function App() {
  const [page, setPage] = useState("trade");
  const wallet = useWallet();

  if (page === "trade") {
    return <TradePage onNavigate={setPage} wallet={wallet} />;
  }

  return <HomePage onNavigate={setPage} wallet={wallet} />;
}

export default App;