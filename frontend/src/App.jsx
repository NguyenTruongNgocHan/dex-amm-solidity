import { useState } from "react";
import HomePage from "./pages/HomePage";
import TradePage from "./pages/TradePage";

function App() {
  const [page, setPage] = useState("home");

  return page === "trade" ? (
    <TradePage onNavigate={setPage} />
  ) : (
    <HomePage onNavigate={setPage} />
  );
}

export default App;