import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Providers } from "./components/Providers";
import { SessionManager } from './components/SessionManager';
import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import PortfolioPage from "./pages/PortfolioPage";
import NewsPage from "./pages/NewsPage";
import CoinDetailPage from './components/CoinDetailPage';

function App() {
  return (
    <Providers>
      <SessionManager />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/coin/:id" element={<CoinDetailPage />} />
        </Routes>
      </Router>
    </Providers>
  );
}

export default App;
