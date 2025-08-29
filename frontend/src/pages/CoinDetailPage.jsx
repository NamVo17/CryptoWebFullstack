import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons'
import api from '../services/api'
import CoinChart from '../components/CoinChart'

function CoinDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [coinData, setCoinData] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState("overview")       // overview | markets
  const [tradeTab, setTradeTab] = useState("buy")   // mặc định Mua
  const [metric, setMetric] = useState("price")    // price | marketcap
  const [chartType, setChartType] = useState("line") // line | bar
  const [timeRange, setTimeRange] = useState("24H") // 24H, 7D, 1M, 3M, 1Y
  const { isAuthenticated } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/coins/${id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`)
        setCoinData(response.data)
        setError(null)
      } catch (err) {
        setError('Could not fetch coin data')
        console.error('Error fetching coin data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCoinData()
    }
  }, [id])

  return (
    <>
      <Header />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      ) : coinData ? (
        <div className="bg-white text-gray-700 font-sans">
          <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row gap-6">
            {/* Left panel */}
            <div className="md:w-[360px] flex flex-col gap-4">
              {/* Breadcrumb */}
              <nav className="text-xs font-normal text-gray-400 flex items-center gap-1 select-none">
                <span
                  className="text-[#4caf50] font-semibold cursor-pointer"
                  onClick={() => navigate('/market')}
                >
                  Cryptocurrencies
                </span>
                <svg aria-hidden="true" className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-gray-400 cursor-default">
                  {coinData.name} Price
                </span>
              </nav>
              {/* Title and rank */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <img
                    src={coinData.image.thumb}
                    alt={coinData.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-bold text-gray-900 text-lg select-text">
                    {coinData.name}
                  </span>
                  <span className="text-xs text-gray-500 select-text">
                    {coinData.symbol.toUpperCase()} Price
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-gray-200 rounded-lg px-1.5 py-0.5 select-none">
                  #{coinData.market_cap_rank}
                </div>
              </div>
              {/* Price and change */}
              <div className="flex items-center gap-2">
                <span className="text-4xl font-extrabold text-gray-900 select-text">
                  ${coinData.market_data.current_price.usd.toLocaleString()}
                </span>
                <span className={`font-semibold text-base select-text flex items-center gap-1 ${coinData.market_data.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  <svg aria-hidden="true" className="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20">
                    <path d={coinData.market_data.price_change_percentage_24h >= 0 ? "M5 12l5-5 5 5H5z" : "M5 8l5 5 5-5H5z"}></path>
                  </svg>
                  {Math.abs(coinData.market_data.price_change_percentage_24h).toFixed(1)}% (24h)
                </span>
                <svg aria-hidden="true" className="w-4 h-4 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                  <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              {/* BTC amount and change */}
              <div className="flex items-center gap-1 text-xs font-semibold select-text">
                <span className="text-gray-500">
                  {coinData.market_data.current_price.btc.toFixed(8)} BTC
                </span>
                <svg
                  aria-hidden="true"
                  className={`w-3 h-3 ${coinData.market_data.price_change_percentage_24h_in_currency.btc >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                    }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d={
                    coinData.market_data.price_change_percentage_24h_in_currency.btc >= 0
                      ? "M5 12l5-5 5 5H5z"
                      : "M5 8l5 5 5-5H5z"
                  } />
                </svg>
                <span className={
                  coinData.market_data.price_change_percentage_24h_in_currency.btc >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }>
                  {Math.abs(coinData.market_data.price_change_percentage_24h_in_currency.btc).toFixed(2)}%
                </span>
              </div>
              <div className="w-full flex flex-col gap-1 text-xs font-semibold select-none">
                {/* Thanh range */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  {/* Thanh gradient */}
                  {coinData.market_data && (
                    <div
                      className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-yellow-400 via-green-500 to-green-700"
                      style={{
                        width: `${((coinData.market_data.current_price.usd - coinData.market_data.low_24h.usd) /
                          (coinData.market_data.high_24h.usd - coinData.market_data.low_24h.usd)) * 100}%`
                      }}
                    ></div>
                  )}
                </div>

                {/* Labels */}
                <div className="flex justify-between items-center text-black">
                  <span>${coinData.market_data.low_24h.usd.toLocaleString()}</span>
                  <span className="text-black">24h Range</span>
                  <span>${coinData.market_data.high_24h.usd.toLocaleString()}</span>
                </div>
              </div>

              {/* Add to Portfolio button */}
              <div className="flex items-center gap-2">
                {/* Add to Portfolio button */}
                <button
                  type="button"
                  className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black hover:border-gray-400  shadow-lg"
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <span className="font-medium">Add to Portfolio</span>
                  <span className="text-xs text-gray-600">• 2,156,434 added</span>
                </button>

                {/* Notification bell button */}
                <button
                  type="button"
                  aria-label="Notification bell"
                  className="border border-gray-300 rounded-lg p-2 text-black hover:border-gray-400  select-none shadow-lg"
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button>
              </div>
              {/* Market data list */}
              <div className="flex flex-col gap-3 mt-4 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-500 select-none">
                    <span>Market Cap</span>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 select-text">
                    ${coinData.market_data.market_cap.usd.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 select-none">
                    <span>Fully Diluted Valuation</span>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 select-text">
                    ${coinData.market_data.fully_diluted_valuation.usd ? coinData.market_data.fully_diluted_valuation.usd.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 select-none">
                    <span>24 Hour Trading Vol</span>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 select-text">
                    ${coinData.market_data.total_volume.usd.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 select-none">
                    <span>Circulating Supply</span>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 select-text">
                    {coinData.market_data.circulating_supply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 select-none">
                    <span>Total Supply</span>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 select-text">
                    {coinData.market_data.total_supply ? coinData.market_data.total_supply.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 select-none">
                    <span>Max Supply</span>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 select-text">
                    {coinData.market_data.max_supply ? coinData.market_data.max_supply.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
              {/* Form Mua/Bán */}
              <div className="w-full  text-white font-sans bg-gray-100 mt-4 p-4 rounded-lg shadow-md ">
                {/* Tabs Mua/Bán */}
                <div className="flex space-x-2 mb-4">
                  <button
                    className={`flex-1 py-2 rounded-lg hover:bg-[#2BC67D] font-semibold text-sm ${tradeTab === "buy"
                      ? "bg-[#2BC67D] text-white"
                      : "bg-gray-300 text-gray-900"
                      }`}
                    onClick={() => setTradeTab("buy")}
                  >
                    Mua
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg hover:bg-[#F6465D] font-semibold text-sm ${tradeTab === "sell"
                      ? "bg-[#F6465D] text-white"
                      : "bg-gray-300 text-gray-900"
                      }`}
                    onClick={() => setTradeTab("sell")}
                  >
                    Bán
                  </button>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center justify-center space-x-4 mb-4 text-sm font-semibold">
                  <span className="text-black">Giới hạn</span>
                  <span className="text-gray-400">Thị trường</span>
                </div>
                {/* Input Giá */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 select-none">
                    Giá
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                    <input
                      type="text"
                      defaultValue="110.615,37"
                      className="bg-white text-gray-900 text-sm px-3 h-11 w-full outline-none"
                    />
                    <span className="bg-gray-100 text-gray-800 border-l border-gray-300 text-sm font-semibold flex items-center px-3">
                      USDT
                    </span>
                  </div>
                </div>

                {/* Input Số lượng */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 select-none">
                    Số lượng
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                    <input
                      type="text"
                      className="bg-white text-gray-900 text-sm px-3 h-11 w-full outline-none"
                    />
                    <span className="bg-gray-100 text-gray-800 border-l border-gray-300 text-sm font-semibold flex items-center px-4">
                      BTC
                    </span>
                  </div>
                </div>
                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="25"
                  defaultValue="0"
                  className="w-full accent-[#2BC67D] mb-4"
                />

                {/* Khả dụng */}
                <div className="flex justify-between text-xs text-black mb-2 select-none">
                  <span>Khả dụng</span>
                  <div className="text-right">
                    <span className="block">- {tradeTab === "buy" ? "USDT" : "BTC"}
                    </span>
                    <span className="block">-- {tradeTab === "buy" ? "BTC" : "USDT"}
                    </span>
                  </div>
                </div>

                {/* Nút Đăng nhập */}
                {isAuthenticated ? (
                  <button
                    type="button"
                    className={`w-full rounded-lg py-2 text-white font-semibold text-sm 
                    ${tradeTab === "buy"
                        ? "bg-[#2BC67D] hover:bg-[#28b872]"
                        : "bg-[#F6465D] hover:bg-[#d63c50]"
                      }`}
                  >
                    {tradeTab === 'buy' ? 'Mua' : 'Bán'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const btn = document.querySelector('button[aria-label="open-login"]');
                      if (btn) btn.click();
                    }}
                    className={`w-full rounded-lg py-2 text-white font-semibold text-sm 
                    ${tradeTab === "buy"
                        ? "bg-[#2BC67D] hover:bg-[#28b872]"
                        : "bg-[#F6465D] hover:bg-[#d63c50]"
                      }`}
                  >
                    Đăng nhập
                  </button>
                )}

              </div>


            </div>
            {/* Right panel */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Top tabs */}
              <nav className="flex gap-6 text-sm font-semibold text-gray-600 border-b border-gray-200 select-none overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setTab("overview")}
                  className={`pb-2 ${tab === "overview" ? "border-b-2 border-green-500 text-gray-900" : "hover:text-gray-900"}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTab("markets")}
                  className={`pb-2 ${tab === "markets" ? "border-b-2 border-green-500 text-gray-900" : "hover:text-gray-900"}`}
                >
                  Markets
                </button>
              </nav>

              {/* Sub tabs and controls */}
              <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg p-1 text-xs font-medium text-gray-600 select-none">
                {/* Left group */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMetric("price")}
                    className={`rounded px-3 py-1 ${metric === "price" ? "bg-white text-gray-900" : "hover:text-gray-900"}`}
                  >
                    Price
                  </button>
                  <button
                    onClick={() => setMetric("marketcap")}
                    className={`rounded px-3 py-1 ${metric === "marketcap" ? "bg-white text-gray-900" : "hover:text-gray-900"}`}
                  >
                    Market Cap
                  </button>
                </div>

                {/* Chart type icons */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setChartType("line")}
                    className={`rounded p-1 px-2 py-1 ${chartType === "line" ? "bg-white" : ""}`}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`rounded p-1 px-2 py-1 ${chartType === "bar" ? "bg-white" : ""}`}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M9 17V9m6 8v-4" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                </div>

                {/* Time range buttons */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {["24H", "7D", "1M", "3M", "1Y"].map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded px-3 py-1 ${timeRange === range ? "bg-white text-gray-900" : "hover:text-gray-900"}`}
                    >
                      {range}
                    </button>
                  ))}
                  <button aria-label="Fullscreen" className="rounded p-1 px-2 py-1">
                    <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className="text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Chart area */}
              <div className="relative bg-white border border-gray-100 rounded-md p-4 select-none">
                <p className="text-sm text-gray-500 mb-2">
                  Tab: {tab} | Metric: {metric} | Chart: {chartType} | Range: {timeRange}
                </p>
                <CoinChart
                  id={id}
                  metric={metric}       // "price" hoặc "marketcap"
                  chartType={chartType} // "line" hoặc "bar"
                  timeRange={timeRange} // "24H", "7D", "1M", "3M", "1Y"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </>
  )
}

export default CoinDetailPage
