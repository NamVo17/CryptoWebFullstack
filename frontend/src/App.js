import React from "react";
import { Routes, Route } from "react-router-dom";
import Providers from "./components/shared/providers/Providers";
import {SessionManager} from "./components/shared/auth/SessionManager";
import HomePage from "./pages/HomePage";
import MarketPage from "./pages/crypto/MarketPage";
import PortfolioPage from "./pages/user/PortfolioPage";
import NewsPage from "./pages/crypto/NewsPage";
import CoinDetailPage from "./components/features/crypto/CoinDetailPage";

function App() {
  return (
    <Providers>
      <SessionManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/coin/:id" element={<CoinDetailPage />} />
      </Routes>
    </Providers>
  );
}

export default App;
