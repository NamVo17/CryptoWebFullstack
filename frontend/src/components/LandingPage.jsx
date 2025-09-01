import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { translations } from "../utils/translations";
import { Apple, QrCode } from "lucide-react";
import useCryptoData from "../hooks/useCryptoData";

const CryptoPrice = React.memo(({ price, change, isPositive }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-semibold">{price}</span>
      <span className={`${isPositive ? "text-green-500" : "text-[#E63946]"}`}>
        {change}
      </span>
    </div>
  );
});

const CryptoRow = React.memo(({ icon, symbol, name, price, change, isPositive }) => {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img
          alt={`${symbol} logo`}
          className="w-5 h-5 rounded-full"
          src={icon}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/20x20?text=?";
          }}
        />
        <div>
          <span className="font-semibold">{symbol}</span>
          <span className="text-[#5A5F6E] ml-1">{name}</span>
        </div>
      </div>

      {/* chỉ re-render phần này khi giá thay đổi */}
      <CryptoPrice price={price} change={change} isPositive={isPositive} />
    </li>
  );
});

const LandingPage = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.settings);
  const { coins, loading, error } = useSelector((state) => state.crypto);
  const t = translations[language] || {};

  const [showNewListings, setShowNewListings] = useState(false);
  const [count, setCount] = useState(285488470);
  const [target, setTarget] = useState(285488470);

  // Cứ 3s lại set target mới (tăng thêm ngẫu nhiên từ 1 - 100)
  useEffect(() => {
    const interval = setInterval(() => {
      setTarget((prev) => prev + Math.floor(Math.random() * 100) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Easing function: ease-out
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  // Sử dụng custom hook để fetch data
  useCryptoData();

  // Animate counter đến target
  useEffect(() => {
    if (count < target) {
      const start = count;
      const end = target;
      const duration = 1000;
      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = easeOutQuad(progress);
        const newValue = Math.floor(start + (end - start) * eased);
        setCount(newValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [target]);

  const formatNumber = (num) => num.toLocaleString("en-US");

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined) return "0.00%";
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // Get specific coins for new listings
  const getSpecificCoins = () => {
    const specificSymbols = ["shib", "link", "avax", "axs", "theta"];
    return coins.filter(coin => 
      specificSymbols.includes(coin.symbol?.toLowerCase())
    );
  };

  // Format API data for display - get either top 5 popular coins or new listings
  const cryptoData = (showNewListings ? 
    // For new listings, get specific coins from API data
    getSpecificCoins() :
    // For popular coins, just take the first 5 (assuming they're already sorted by market cap/volume)
    coins.slice(0, 5)
  ).map((coin) => ({
    symbol: coin.symbol?.toUpperCase() || "N/A",
    name: coin.name || "Unknown",
    price: formatPrice(coin.current_price || 0),
    change: formatPercentage(coin.price_change_percentage_24h),
    icon: coin.image || "https://via.placeholder.com/20x20?text=?",
    isPositive: (coin.price_change_percentage_24h || 0) >= 0,
  }));


  // Mock data news
  const newsData = [
    language === "vi"
      ? "Thị Trường Chứng Khoán Mỹ Tiếp Tục Xu Hướng Giảm Khi Nasdaq Giảm"
      : "US Stock Market Continues Downtrend as Nasdaq Falls",
    language === "vi"
      ? "Chủ tịch SEC sẽ thảo luận về Dự án Crypto tại Hội thảo Blockchain Wyoming"
      : "SEC Chair to Discuss Crypto Project at Wyoming Blockchain Conference",
    language === "vi"
      ? "Bitcoin Trải Qua Sự Sụt Giảm Dưới 114,000 USDT"
      : "Bitcoin Experiences Drop Below 114,000 USDT",
    language === "vi"
      ? "Chỉ số Dow Jones đạt mức cao kỷ lục mới"
      : "Dow Jones Index Hits New Record High",
  ];
  return (
    <div className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-50 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-20">
        {/* Left Section */}
        <div className="flex-1 max-w-lg">
          <h1 className="font-extrabold text-[48px] leading-[56px] mb-6">
            <span className="text-[#F5B916]">{formatNumber(count)}</span>
            <br />{t.peopleTrustMe || "NGƯỜI TIN  TƯỞNG CHÚNG TÔI"}<br /> 
          </h1>
          <form className="flex gap-3 mb-10 max-w-md">
            <input className="flex-1 bg-white border border-[#2A2F3D] rounded-lg px-4 py-2 text-sm text-[#A1A6B0] focus:outline-none focus:ring-2 focus:ring-[#F5B916]" placeholder={t.emailPhonePlaceholder || "Email/Số điện thoại"} type="text" />
            <button className="bg-[#F5B916] text-[#12161E] font-semibold rounded-lg px-5 py-2 text-sm hover:bg-yellow-200 transition" type="submit" >
            {t.startButton || "Hãy bắt đầu"}
            </button>
          </form>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-xs text-[#5A5F6E]">
            <div className="flex items-center gap-2">
              <span>{t.continueWith || "Hoặc tiếp tục với"}</span>
              <button aria-label="Continue with Google" className="dark:bg-[#1B1F2A] bg-gray-200 p-2 rounded-lg hover:bg-[#2A2F3D] transition" >
                <img alt="Google logo" className="w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" />
              </button>
              <button aria-label="Continue with Apple" className="dark:bg-[#1B1F2A] bg-gray-200 p-2 rounded-lg hover:bg-[#2A2F3D] transition" >
                <Apple className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span>{t.downloadApp || "Tải ứng dụng"}</span>
              <button aria-label="Download app QR code" className="dark:bg-[#1B1F2A] bg-gray-200 p-2 rounded-lg hover:bg-[#2A2F3D] transition" >
                <QrCode className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          {/* Top Box - Crypto Prices */}
          <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between text-xs text-[#5A5F6E] mb-2">
              <div className="flex gap-6">
                <button 
                  className={`font-semibold ${!showNewListings ? 'text-black dark:text-white' : 'text-[#5A5F6E]'}`}
                  onClick={() => setShowNewListings(false)}
                >
                  {t.popular || "Phổ biến"}
                </button>
                <button 
                  className={`font-semibold ${showNewListings ? 'text-black dark:text-white' : 'text-[#5A5F6E]'}`}
                  onClick={() => setShowNewListings(true)}
                >
                  {t.newListings || "Niêm yết mới"}
                </button>
              </div>
              <a href="/market" className="hover:underline cursor-pointer">{t.seeAllCoins || "Xem tất cả 100+ coin"}</a>
            </div>

            {loading && coins.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5B916]"></div>
                <span className="ml-2 text-sm text-[#5A5F6E]">{t.loading || "Đang tải dữ liệu..."}</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-2">{t.loadError || "Không thể tải dữ liệu crypto"}</p>
                <button
                  onClick={() => dispatch(fetchCryptoData())}
                  className="text-xs text-[#F5B916] hover:underline"
                >
                  {t.tryAgain || "Thử lại"}
                </button>
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                {cryptoData.map((crypto, index) => (
                  <CryptoRow key={index} {...crypto} />
                ))}
              </ul>
            )}
          </div>


          {/* Bottom Box - News */}
          <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between text-xs text-[#5A5F6E] mb-2">
              <div className="font-semibold text-black dark:text-white">{t.news || "Tin tức"}</div>
              <a href="/news" className="hover:underline cursor-pointer">{t.seeAllNews || "Xem tất cả tin tức"}</a>
            </div>
            <ul className="text-sm space-y-3">
              {newsData.map((news, index) => (
                <li key={index} className="hover:text-[#F5B916] cursor-pointer transition">
                  {news}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
