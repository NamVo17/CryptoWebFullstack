import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Providers } from "./components/Providers";
import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import PortfolioPage from "./pages/PortfolioPage";
import NewsPage from "./pages/NewsPage";
import CoinDetailPage from './pages/CoinDetailPage';


function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/coin/:id" element={<CoinDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>
      </Router>
    </Providers>
  );
}

export default App;
