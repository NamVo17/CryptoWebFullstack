import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { translations } from "../../utils/formatters/translations";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet } from "lucide-react";

const PortfolioPage = () => {
  const { language } = useSelector((state) => state.settings);
  const { portfolio } = useSelector((state) => state.user);
  const { coins } = useSelector((state) => state.crypto);
  const t = translations[language];

  // Process portfolio data to aggregate by coin and calculate values
  const aggregatedPortfolio = portfolio.reduce((acc, order) => {
    const coinId = order.coinId;
    
    if (!acc[coinId]) {
      acc[coinId] = {
        id: coinId,
        symbol: order.coinSymbol,
        name: order.coinName,
        totalQuantity: 0,
        totalCost: 0,
        orders: []
      };
    }
    
    acc[coinId].totalQuantity += order.quantity;
    acc[coinId].totalCost += (order.quantity > 0 ? order.quantity * order.price : 0);
    acc[coinId].orders.push(order);
    
    return acc;
  }, {});

  // Convert to array and calculate final values
  const processedPortfolio = Object.values(aggregatedPortfolio)
    .filter(coin => coin.totalQuantity > 0) // Only show coins with positive balance
    .map(coin => {
      // Find current coin data for price updates
      const coinData = coins.find(c => c.id === coin.id);
      const currentPrice = coinData?.current_price || coin.totalCost / coin.totalQuantity;
      const avgPrice = coin.totalCost / coin.totalQuantity;
      
      return {
        ...coin,
        amount: coin.totalQuantity,
        avgPrice: avgPrice,
        currentPrice: currentPrice,
        value: currentPrice * coin.totalQuantity,
        change24h: coinData?.price_change_percentage_24h || 0,
        allocation: 0, // Will be calculated after we have total value
      };
    });

  const totalValue = processedPortfolio.reduce((sum, asset) => sum + asset.value, 0);
  const totalCost = processedPortfolio.reduce((sum, asset) => sum + (asset.amount * asset.avgPrice), 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitPercentage = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

  // Calculate allocation percentages
  const portfolioWithAllocation = processedPortfolio.map(asset => ({
    ...asset,
    allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Page Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.portfolio || "Danh mục đầu tư"}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.portfolioDescription || "Quản lý và theo dõi hiệu suất danh mục cryptocurrency của bạn"}</p>
        </div>

        {/* Portfolio Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalValue || "Tổng giá trị"}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalCost || "Tổng chi phí"}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalCost.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalProfit || "Tổng lợi nhuận"}</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${totalProfit.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${totalProfit >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                {totalProfit >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.profitPercentage || "Tỷ lệ lợi nhuận"}</p>
                <p className={`text-2xl font-bold ${totalProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalProfitPercentage.toFixed(2)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Table */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.portfolioAssets || "Tài sản trong danh mục"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.asset || "Tài sản"}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.amount || "Số lượng"}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.avgPrice || "Giá TB"}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.currentPrice || "Giá hiện tại"}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.value || "Giá trị"}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.change24h || "Thay đổi 24h"}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.allocation || "Phân bổ"}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {portfolioWithAllocation.length > 0 ? portfolioWithAllocation.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">{asset.symbol}</div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{asset.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${asset.avgPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${asset.currentPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${asset.value.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${asset.change24h >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{asset.allocation.toFixed(1)}%</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {t.noPortfolioData || "Chưa có giao dịch nào trong danh mục"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Portfolio Chart Placeholder */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.portfolioChart || "Biểu đồ danh mục"}</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">{t.pieChart || "Biểu đồ tròn"}</button>
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">{t.barChart || "Biểu đồ cột"}</button>
            </div>
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t.chartPlaceholder || "Biểu đồ phân bổ danh mục sẽ được hiển thị ở đây"}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioPage;

