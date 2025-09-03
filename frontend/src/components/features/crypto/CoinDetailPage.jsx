import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { cryptoAPI } from '../../../services/api/cryptoAPI';
import CoinChart from '../crypto/CoinChart';
import { translations } from '../../../utils/formatters/translations';
import { addToPortfolio } from '../../../store/slices/userSlice';

function CoinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [coinData, setCoinData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | markets
  const [tradeTab, setTradeTab] = useState('buy'); // buy | sell
  const [metric, setMetric] = useState('price'); // price | marketcap
  const [chartType, setChartType] = useState('line'); // line | bar
  const [timeRange, setTimeRange] = useState('24H'); // 24H, 7D, 1M, 3M, 1Y
  const [orderType, setOrderType] = useState('limit'); // limit | market
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.user);
  const { language } = useSelector((state) => state.settings);
  const t = translations[language] || translations['en'];

  const { balance } = useSelector((state) => state.user);

  const getCurrentCoinSymbol = () => {
    return coinData?.symbol?.toUpperCase() || 'BTC';
  };

  const getCurrentPrice = () => {
    if (orderType === 'market') {
      return coinData?.market_data?.current_price?.usd || 0;
    }
    // Loại bỏ tất cả dấu phẩy và dấu chấm vì đây là giá nguyên
    const cleanPrice = price.replace(/[.,]/g, '');
    return parseFloat(cleanPrice) || 0;
  };

  const getAvailableBalance = () => {
    if (tradeTab === 'buy') {
      return balance?.usdt || 0;
    }
    const coinSymbol = coinData?.symbol?.toLowerCase() || 'btc';
    return balance?.[coinSymbol] || 0;
  };

  const getTotalAmount = () => {
    const currentPrice = getCurrentPrice();
    const qty = parseFloat(quantity) || 0;
    return currentPrice * qty;
  };

  const handlePriceChange = (e) => {
    if (orderType === 'limit') {
      setPrice(e.target.value);
      if (quantity) {
        // Loại bỏ tất cả dấu phẩy và dấu chấm vì đây là giá nguyên
        const cleanPrice = parseFloat(e.target.value.replace(/[.,]/g, '')) || 0;
        if (tradeTab === 'buy') {
          const qty = parseFloat(quantity) || 0;
          const total = qty * cleanPrice;
          const percentage = (total / (balance?.usdt || 0)) * 100;
          setSliderValue(Math.min(100, Math.max(0, percentage)));
        } else {
          const qty = parseFloat(quantity) || 0;
          const coinSymbol = coinData?.symbol?.toLowerCase() || 'btc';
          const coinBalance = balance?.[coinSymbol] || 0;
          const percentage = (qty / coinBalance) * 100;
          setSliderValue(Math.min(100, Math.max(0, percentage)));
        }
      }
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (tradeTab === 'buy') {
      const qty = parseFloat(value) || 0;
      const price = getCurrentPrice();
      const total = qty * price;
      const percentage = (total / (balance?.usdt || 0)) * 100;
      setSliderValue(Math.min(100, Math.max(0, percentage)));
    } else {
      const qty = parseFloat(value) || 0;
      const coinSymbol = coinData?.symbol?.toLowerCase() || 'btc';
      const coinBalance = balance?.[coinSymbol] || 0;
      const percentage = (qty / coinBalance) * 100;
      setSliderValue(Math.min(100, Math.max(0, percentage)));
    }
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    if (tradeTab === 'buy') {
      const availableUSDT = balance?.usdt || 0;
      const total = (value / 100) * availableUSDT;
      const currentPrice = getCurrentPrice();
      if (currentPrice > 0) {
        // Tính số lượng coin có thể mua với số USDT đã chọn
        const calculatedQuantity = total / currentPrice;
        setQuantity(calculatedQuantity.toFixed(8));
      }
    } else {
      const coinSymbol = coinData?.symbol?.toLowerCase() || 'btc';
      const coinBalance = balance?.[coinSymbol] || 0;
      const qty = (value / 100) * coinBalance;
      setQuantity(qty.toFixed(8));
    }
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === 'market') {
      setPrice(coinData?.market_data?.current_price?.usd?.toLocaleString() || '0');
    }
    setQuantity('');
    setSliderValue(0);
  };

  const handleTradeTabChange = (tab) => {
    setTradeTab(tab);
    setQuantity('');
    setSliderValue(0);
    if (orderType === 'market' && coinData) {
      setPrice(coinData.market_data.current_price.usd.toLocaleString());
    } else if (orderType === 'limit' && coinData && !price) {
      setPrice(coinData.market_data.current_price.usd.toLocaleString());
    }
  };

  const handleOrder = () => {
    if (!isAuthenticated) return;

    if (!quantity || parseFloat(quantity) <= 0) {
      // Replace with toast notification (e.g., react-toastify)
      // toast.error(t.invalidQuantity || 'Please enter a valid quantity!');
      alert(t.invalidQuantity || 'Please enter a valid quantity!');
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price.replace(/,/g, '')) <= 0)) {
      // toast.error(t.invalidPrice || 'Please enter a valid price!');
      alert(t.invalidPrice || 'Please enter a valid price!');
      return;
    }

    const currentPrice = getCurrentPrice();
    const qty = parseFloat(quantity);
    const total = currentPrice * qty;

    if (tradeTab === 'buy') {
      if (total > (balance?.usdt || 0)) {
        alert(
          t.insufficientUSDT ||
            `Insufficient USDT! You need ${total.toFixed(2)} USDT but have ${balance?.usdt || 0} USDT`
        );
        return;
      }
    } else {
      const coinSymbol = coinData?.symbol?.toLowerCase() || 'btc';
      const coinBalance = balance?.[coinSymbol] || 0;
      if (qty > coinBalance) {
        // toast.error(t.insufficientCoin || `Insufficient ${getCurrentCoinSymbol()}! You need ${qty} ${getCurrentCoinSymbol()} but have ${coinBalance} ${getCurrentCoinSymbol()}`);
        alert(
          t.insufficientCoin ||
            `Insufficient ${getCurrentCoinSymbol()}! You need ${qty} ${getCurrentCoinSymbol()} but have ${coinBalance} ${getCurrentCoinSymbol()}`
        );
        return;
      }
    }

    const orderData = {
      coinId: id,
      coinName: coinData.name,
      coinSymbol: coinData.symbol.toUpperCase(),
      orderType,
      tradeType: tradeTab,
      price: currentPrice,
      quantity: tradeTab === 'sell' ? -qty : qty,
      totalAmount: total,
      timestamp: new Date().toISOString(),
    };

    dispatch(addToPortfolio(orderData));
    setQuantity('');
    setSliderValue(0);
    // toast.success(t.orderSuccess || `${tradeTab === 'buy' ? 'Bought' : 'Sold'} ${coinData.symbol.toUpperCase()} successfully!`);
    alert(
      t.orderSuccess ||
        `${tradeTab === 'buy' ? 'Bought' : 'Sold'} ${coinData.symbol.toUpperCase()} successfully!`
    );
  };

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await cryptoAPI.getCoinDetail(id);
        if (response.data) {
          setCoinData(response.data);
        } else {
          throw new Error('No data received from API');
        }
      } catch (err) {
        console.error('Error fetching coin data:', err);
        setError(t.fetchError || 'Failed to fetch coin data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoinData();
    }
  }, [id, t]);

  useEffect(() => {
    if (coinData && !price) {
      const newPrice = coinData.market_data.current_price.usd.toLocaleString();
      if (orderType === 'market' || orderType === 'limit') {
        setPrice(newPrice);
      }
    }
  }, [coinData, orderType, price]);

  return (
    <>
      <Header 
        isLoginOpen={isLoginModalOpen}
        onLoginOpenChange={setIsLoginModalOpen}
        isRegisterOpen={isRegisterModalOpen}
        onRegisterOpenChange={setIsRegisterModalOpen}
      />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 dark:text-red-400">
            {error}
          </div>
        </div>
      ) : coinData ? (
        <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-sans">
          <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row gap-6">
            {/* Left panel */}
            <div className="md:w-[360px] flex flex-col gap-4">
              <nav className="text-xs font-normal text-gray-400 dark:text-gray-500 flex items-center gap-1 select-none">
                <span
                  className="text-[#4caf50] font-semibold cursor-pointer"
                  onClick={() => navigate('/market')}
                  aria-label={t.cryptocurrencies || 'Cryptocurrencies'}
                >
                  {t.cryptocurrencies || 'Cryptocurrencies'}
                </span>
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-gray-400 dark:text-gray-500 cursor-default">
                  {coinData.name} {t.price || 'Price'}
                </span>
              </nav>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <img src={coinData.image.thumb} alt={coinData.name} className="w-6 h-6 rounded-full" />
                  <span className="font-bold text-gray-900 dark:text-white text-lg select-text">
                    {coinData.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 select-text">
                    {coinData.symbol.toUpperCase()} {t.price || 'Price'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-lg px-1.5 py-0.5 select-none">
                  #{coinData.market_cap_rank}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white select-text">
                  ${coinData.market_data.current_price.usd.toLocaleString()}
                </span>
                <span
                  className={`font-semibold text-base select-text flex items-center gap-1 ${
                    coinData.market_data.price_change_percentage_24h >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 fill-current"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d={
                        coinData.market_data.price_change_percentage_24h >= 0
                          ? 'M5 12l5-5 5 5H5z'
                          : 'M5 8l5 5 5-5H5z'
                      }
                    ></path>
                  </svg>
                  {Math.abs(coinData.market_data.price_change_percentage_24h).toFixed(1)}% (24h)
                </span>
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                  <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold select-text">
                <span className="text-gray-500 dark:text-gray-400">
                  {coinData.market_data.current_price.btc.toFixed(8)} BTC
                </span>
                <svg
                  aria-hidden="true"
                  className={`w-3 h-3 ${
                    coinData.market_data.price_change_percentage_24h_in_currency.btc >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d={
                      coinData.market_data.price_change_percentage_24h_in_currency.btc >= 0
                        ? 'M5 12l5-5 5 5H5z'
                        : 'M5 8l5 5 5-5H5z'
                    }
                  />
                </svg>
                <span
                  className={
                    coinData.market_data.price_change_percentage_24h_in_currency.btc >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }
                >
                  {Math.abs(coinData.market_data.price_change_percentage_24h_in_currency.btc).toFixed(2)}%
                </span>
              </div>

              <div className="w-full flex flex-col gap-1 text-xs font-semibold select-none">
                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  {coinData.market_data && (
                    <div
                      className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-yellow-400 via-green-500 to-green-700"
                      style={{
                        width: `${
                          ((coinData.market_data.current_price.usd - coinData.market_data.low_24h.usd) /
                            (coinData.market_data.high_24h.usd - coinData.market_data.low_24h.usd)) *
                          100
                        }%`,
                      }}
                    ></div>
                  )}
                </div>
                <div className="flex justify-between items-center text-black dark:text-white">
                  <span>${coinData.market_data.low_24h.usd.toLocaleString()}</span>
                  <span className="text-black dark:text-white">24h {t.range || 'Range'}</span>
                  <span>${coinData.market_data.high_24h.usd.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-black dark:text-white hover:border-gray-400 dark:hover:border-gray-500 shadow-lg"
                  aria-label={t.addToPortfolio || 'Add to Portfolio'}
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-black dark:text-white"
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
                  <span className="font-medium">{t.addToPortfolio || 'Add to Portfolio'}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    • 2,156,434 {t.added || 'added'}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={t.notification || 'Notification bell'}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-black dark:text-white hover:border-gray-400 dark:hover:border-gray-500 select-none shadow-lg"
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

              <div className="flex flex-col gap-3 mt-4 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 select-none">
                    <span>{t.marketCap || 'Market Cap'}</span>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white select-text">
                    ${coinData.market_data.market_cap.usd.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 select-none">
                    <span>{t.fullyDilutedValuation || 'Fully Diluted Valuation'}</span>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white select-text">
                    ${coinData.market_data.fully_diluted_valuation.usd
                      ? coinData.market_data.fully_diluted_valuation.usd.toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 select-none">
                    <span>{t.hourTradingVol || '24 Hour Trading Vol'}</span>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white select-text">
                    ${coinData.market_data.total_volume.usd.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 select-none">
                    <span>{t.circulatingSupply || 'Circulating Supply'}</span>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white select-text">
                    {coinData.market_data.circulating_supply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 select-none">
                    <span>{t.totalSupply || 'Total Supply'}</span>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white select-text">
                    {coinData.market_data.total_supply
                      ? coinData.market_data.total_supply.toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 select-none">
                    <span>{t.maxSupply || 'Max Supply'}</span>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white select-text">
                    {coinData.market_data.max_supply
                      ? coinData.market_data.max_supply.toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="w-full text-white font-sans bg-gray-100 dark:bg-gray-700 mt-4 p-4 rounded-lg shadow-md">
                <div className="flex space-x-2 mb-4">
                  <button
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                      tradeTab === 'buy'
                        ? 'bg-[#2BC67D] text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white'
                    } hover:bg-[#2BC67D]`}
                    onClick={() => handleTradeTabChange('buy')}
                    aria-label={t.buy || 'Buy'}
                  >
                    {t.buy || 'Buy'}
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                      tradeTab === 'sell'
                        ? 'bg-[#F6465D] text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white'
                    } hover:bg-[#F6465D]`}
                    onClick={() => handleTradeTabChange('sell')}
                    aria-label={t.sell || 'Sell'}
                  >
                    {t.sell || 'Sell'}
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-4 mb-4 text-sm font-semibold">
                  <button
                    onClick={() => handleOrderTypeChange('limit')}
                    className={`px-3 py-1 rounded ${
                      orderType === 'limit' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-300'
                    }`}
                    aria-label={t.limit || 'Limit Order'}
                  >
                    {t.limit || 'Limit'}
                  </button>
                  <button
                    onClick={() => handleOrderTypeChange('market')}
                    className={`px-3 py-1 rounded ${
                      orderType === 'market' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-300'
                    }`}
                    aria-label={t.market || 'Market Order'}
                  >
                    {t.market || 'Market'}
                  </button>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 select-none"
                    htmlFor="price-input"
                  >
                    {t.price || 'Price'}
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                    <input
                      id="price-input"
                      type="text"
                      value={price}
                      onChange={handlePriceChange}
                      disabled={orderType === 'market'}
                      className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 h-11 w-full outline-none ${
                        orderType === 'market' ? 'cursor-not-allowed opacity-60' : ''
                      }`}
                      aria-invalid={price && parseFloat(price.replace(/,/g, '')) <= 0 ? 'true' : 'false'}
                      aria-describedby={
                        price && parseFloat(price.replace(/,/g, '')) <= 0 ? 'price-error' : undefined
                      }
                    />
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-l border-gray-300 dark:border-gray-600 text-sm font-semibold flex items-center px-3">
                      USDT
                    </span>
                  </div>
                  {price && parseFloat(price.replace(/,/g, '')) <= 0 && (
                    <span id="price-error" className="text-red-500 text-xs">
                      {t.invalidPrice || 'Please enter a valid price.'}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 select-none"
                    htmlFor="quantity-input"
                  >
                    {t.quantity || 'Quantity'}
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                    <input
                      id="quantity-input"
                      type="text"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 h-11 w-full outline-none"
                      aria-invalid={quantity && parseFloat(quantity) <= 0 ? 'true' : 'false'}
                      aria-describedby={
                        quantity && parseFloat(quantity) <= 0 ? 'quantity-error' : undefined
                      }
                    />
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-l border-gray-300 dark:border-gray-600 text-sm font-semibold flex items-center px-4">
                      {getCurrentCoinSymbol()}
                    </span>
                  </div>
                  {quantity && parseFloat(quantity) <= 0 && (
                    <span id="quantity-error" className="text-red-500 text-xs">
                      {t.invalidQuantity || 'Please enter a valid quantity.'}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-full accent-[#2BC67D] mb-2"
                    aria-label={t.sliderLabel || 'Percentage of available balance'}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-black dark:text-white mb-2 select-none">
                  <span>
                    {tradeTab === 'buy' ? (t.totalamount || 'Total Amount') : (t.receivedValue || 'Received Value')}
                  </span>
                  <div className="text-right">
                    <span className="block">
                      {isAuthenticated && quantity && price
                        ? `${getTotalAmount().toFixed(2)} USDT`
                        : '-- USDT'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-black dark:text-white mb-2 select-none">
                  <span>{t.available || 'Available'}</span>
                  <div className="text-right">
                    <span className="block">
                      {isAuthenticated
                        ? `${getAvailableBalance()} ${tradeTab === 'buy' ? 'USDT' : getCurrentCoinSymbol()}`
                        : '--'}
                    </span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleOrder}
                    className={`w-full rounded-lg py-2 text-white font-semibold text-sm ${
                      tradeTab === 'buy' ? 'bg-[#2BC67D] hover:bg-[#28b872]' : 'bg-[#F6465D] hover:bg-[#d63c50]'
                    }`}
                    aria-label={tradeTab === 'buy' ? (t.buy || 'Buy') : (t.sell || 'Sell')}
                  >
                    {tradeTab === 'buy' ? (t.buy || 'Buy') : (t.sell || 'Sell')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className={`w-full rounded-lg py-2 text-white font-semibold text-sm ${
                      tradeTab === 'buy' ? 'bg-[#2BC67D] hover:bg-[#28b872]' : 'bg-[#F6465D] hover:bg-[#d63c50]'
                    }`}
                    aria-label={t.login || 'Log in'}
                  >
                    {t.login || 'Log in'}
                  </button>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col gap-4">
              <nav className="flex gap-6 text-sm font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 select-none overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setTab('overview')}
                  className={`pb-2 ${
                    tab === 'overview'
                      ? 'border-b-2 border-green-500 text-gray-900 dark:text-white'
                      : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                  aria-label={t.overview || 'Overview'}
                >
                  {t.overview || 'Overview'}
                </button>
                <button
                  onClick={() => setTab('markets')}
                  className={`pb-2 ${
                    tab === 'markets'
                      ? 'border-b-2 border-green-500 text-gray-900 dark:text-white'
                      : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                  aria-label={t.markets || 'Markets'}
                >
                  {t.markets || 'Markets'}
                </button>
              </nav>

              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 text-xs font-medium text-gray-600 dark:text-gray-400 select-none">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setMetric('price')}
                    className={`rounded px-3 py-1 ${
                      metric === 'price'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label={t.price || 'Price'}
                  >
                    {t.price || 'Price'}
                  </button>
                  <button
                    onClick={() => setMetric('marketcap')}
                    className={`rounded px-3 py-1 ${
                      metric === 'marketcap'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label={t.marketCap || 'Market Cap'}
                  >
                    {t.marketCap || 'Market Cap'}
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('line')}
                    className={`rounded p-1 px-2 py-1 ${chartType === 'line' ? 'bg-white dark:bg-gray-600' : ''}`}
                    aria-label={t.lineChart || 'Line Chart'}
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`rounded p-1 px-2 py-1 ${chartType === 'bar' ? 'bg-white dark:bg-gray-600' : ''}`}
                    aria-label={t.barChart || 'Bar Chart'}
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M9 17V9m6 8v-4" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {['24H', '7D', '1M', '3M', '1Y'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded px-3 py-1 ${
                        timeRange === range
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                          : 'hover:text-gray-900 dark:hover:text-white'
                      }`}
                      aria-label={`${t.timeRange || 'Time Range'}: ${range}`}
                    >
                      {range}
                    </button>
                  ))}
                  <button aria-label={t.fullscreen || 'Fullscreen'} className="rounded p-1 px-2 py-1">
                    <FontAwesomeIcon
                      icon={faUpRightAndDownLeftFromCenter}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    />
                  </button>
                </div>
              </div>

              <div className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-4 select-none">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t.tab || 'Tab'}: {tab} | {t.metric || 'Metric'}: {metric} | {t.chart || 'Chart'}: {chartType} |{' '}
                  {t.range || 'Range'}: {timeRange}
                </p>
                <CoinChart id={id} metric={metric} chartType={chartType} timeRange={timeRange} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </>
  );
}

export default CoinDetailPage;