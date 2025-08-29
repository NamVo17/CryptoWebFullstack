import React from "react";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CryptoTable from "../components/CryptoTable";
import MarketOverview from "../components/MarketOverview";
import { translations } from "../utils/translations";
import useCryptoData from "../hooks/useCryptoData";

const MarketPage = () => {
  const { language } = useSelector((state) => state.settings);
  const t = translations[language];
  
  // Sử dụng custom hook để fetch và refresh data
  useCryptoData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Page Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.markets || "Thị trường Crypto"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.marketDescription ||
              "Theo dõi giá cả, biến động và xu hướng thị trường cryptocurrency toàn cầu"}
          </p>
        </div>

        {/* Market Overview */}
        <section>
          <MarketOverview />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <CryptoTable />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketPage;
