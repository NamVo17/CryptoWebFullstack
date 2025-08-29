"use client";

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useSpring, animated } from "@react-spring/web";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { translations } from "../utils/translations";
import useCryptoData from "../hooks/useCryptoData";

// ===== Helper =====
function formatShortNumber(num) {
  if (!num && num !== 0) return "-";
  const absNum = Math.abs(num);
  if (absNum >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (absNum >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (absNum >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (absNum >= 1e3) return `${(num / 1e3).toFixed(2)}K`;

  return num.toLocaleString();
}

function getUsdOrFirst(obj) {
  try {
    // Kiểm tra obj có tồn tại và là object không
    if (!obj || typeof obj !== 'object') {
      return 0;
    }

    // Kiểm tra trường hợp obj.usd tồn tại và là số
    if (obj.usd !== undefined && obj.usd !== null) {
      const usdValue = parseFloat(obj.usd);
      if (!isNaN(usdValue)) {
        return usdValue;
      }
    }

    // Nếu không có usd, lấy giá trị đầu tiên là số
    const values = Object.values(obj);
    for (let value of values) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return numValue;
      }
    }

    // Nếu không tìm thấy giá trị hợp lệ
    return 0;
  } catch (error) {
    console.error('Error in getUsdOrFirst:', error);
    return 0;
  }
}

// ===== Components =====
const StatValue = React.memo(
  ({ rawValue, formattedValue, suffix = "$", change, isPositive, isPercentage = false }) => {
    // Ensure rawValue is a valid number
    const safeRawValue = typeof rawValue === 'number' && !isNaN(rawValue) ? rawValue : 0;
    
    const { number } = useSpring({
      from: { number: safeRawValue },
      number: safeRawValue,
      config: { tension: 210, friction: 20 },
    });

    return (
      <>
        <animated.div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {number.to((n) => {
            try {
              // Check for invalid number
              if (typeof n !== 'number' || isNaN(n)) return `${suffix}0`;
              
              if (formattedValue?.includes("T")) return `${suffix}${(n / 1e12).toFixed(2)}T`;
              if (formattedValue?.includes("B")) return `${suffix}${(n / 1e9).toFixed(2)}B`;
              if (formattedValue?.includes("M")) return `${suffix}${(n / 1e6).toFixed(2)}M`;
              if (formattedValue?.includes("K")) return `${suffix}${(n / 1e3).toFixed(2)}K`;
              if (isPercentage) return `${n.toFixed(2)}%`;
              return `${suffix}${Math.round(n).toLocaleString()}`;
            } catch (err) {
              console.error('Error formatting number:', err);
              return `${suffix}0`;
            }
          })}
        </animated.div>
        {typeof change === "number" && !isNaN(change) && (
          <div className={isPositive ? "text-green-600 text-sm" : "text-red-500 text-sm"}>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        )}
      </>
    );
  },
  (prev, next) => {
    // Enhanced comparison to handle edge cases
    const prevValue = typeof prev.rawValue === 'number' && !isNaN(prev.rawValue) ? prev.rawValue : 0;
    const nextValue = typeof next.rawValue === 'number' && !isNaN(next.rawValue) ? next.rawValue : 0;
    const prevChange = typeof prev.change === 'number' && !isNaN(prev.change) ? prev.change : null;
    const nextChange = typeof next.change === 'number' && !isNaN(next.change) ? next.change : null;
    
    return prevValue === nextValue && prevChange === nextChange;
  }
);

StatValue.displayName = "StatValue";

const StatCard = React.memo(({ stat }) => {
  const isPositive = stat.change >= 0;

  return (
    <div className="bg-white/90 dark:bg-gray-700/80 rounded-2xl border border-gray-200 dark:border-gray-700 shadow p-6 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {stat.title}
          </div>
          <StatValue
            rawValue={stat.rawValue}
            formattedValue={stat.formattedValue}
            suffix={stat.suffix}
            change={stat.change}
            isPositive={isPositive}
            isPercentage={stat.isPercentage} 

          />
        </div>
        <div
          className="ml-2 flex-shrink-0 flex items-center h-12 w-12 justify-center rounded-full"
          style={{
            background:
              stat.iconColor === "text-blue-500"
                ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                : stat.iconColor === "text-green-500"
                  ? "linear-gradient(135deg,#22c55e,#4ade80)"
                  : stat.iconColor === "text-orange-500"
                    ? "linear-gradient(135deg,#f59e42,#f97316)"
                    : stat.iconColor === "text-purple-500"
                      ? "linear-gradient(135deg,#a21caf,#818cf8)"
                      : "#e5e7eb",
          }}
        >
          {stat.icon && <stat.icon className="w-7 h-7 text-white" />}
        </div>
      </div>
    </div>
  );
});
StatCard.displayName = "StatCard";

// ===== MarketOverview =====
const MarketOverview = () => {
  const { globalData, loading, error } = useSelector((state) => state.crypto);
  const { language } = useSelector((state) => state.settings);
  const t = translations[language];

  useCryptoData(); // fetch mỗi 5 phút

  const stats = useMemo(() => {
    // Extract and validate data with fallbacks
    const marketCap = getUsdOrFirst(globalData?.total_market_cap);
    const volume = getUsdOrFirst(globalData?.total_volume);
    const btcDom = globalData?.market_cap_percentage?.btc || 0;
    const activeCoins = globalData?.active_cryptocurrencies || 0;
    
    // Calculate changes safely
    const marketCapChange = globalData?.market_cap_change_percentage_24h_usd 
      ? parseFloat(globalData.market_cap_change_percentage_24h_usd.toFixed(2))
      : 0;

    const volumeChange = globalData?.total_volume_change_24h_usd
      ? parseFloat(globalData.total_volume_change_24h_usd.toFixed(2))
      : 0;

    // Check if we have real data before showing stats
    const hasRealData = marketCap > 0 || volume > 0 || btcDom > 0 || activeCoins > 0;

    return [
      {
        id: "market-cap",
        title: t.totalMarketCap,
        rawValue: marketCap,
        formattedValue: formatShortNumber(marketCap),
        suffix: "$",
        change: marketCapChange,
        icon: DollarSign,
        iconColor: "text-blue-500",
      },
      {
        id: "volume",
        title: t.totalVolume24h,
        rawValue: volume,
        formattedValue: formatShortNumber(volume),
        suffix: "$",
        change: volumeChange,
        icon: Activity,
        iconColor: "text-green-500",
      },
      {
        id: "btc-dominance",
        title: t.btcDominance,
        rawValue: btcDom,
        formattedValue: `${btcDom.toFixed(1)}%`,
        suffix: "",
        isPercentage: true,
        change: btcDom > 0 ? btcDom - (globalData?.market_cap_percentage?.btc_yesterday || btcDom) : 0,
        icon: TrendingUp,
        iconColor: "text-orange-500",
      },
      {
        id: "active-cryptos",
        title: t.activeCryptocurrencies,
        rawValue: activeCoins,
        formattedValue: activeCoins.toLocaleString(),
        suffix: "",
        isPercentage: false,
        change: null,
        icon: Activity,
        iconColor: "text-purple-500",
      },
    ];
  }, [globalData, t]);

  console.log('Market Overview State:', { loading, error, globalData });

  // Kiểm tra xem có dữ liệu hợp lệ không
  const hasValidData = globalData && (
    getUsdOrFirst(globalData.total_market_cap) > 0 ||
    getUsdOrFirst(globalData.total_volume) > 0 ||
    globalData.market_cap_percentage?.btc > 0 ||
    globalData.active_cryptocurrencies > 0
  );

  // Hiển thị skeleton loading khi đang tải và không có dữ liệu
  if (loading && !hasValidData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={`loading-${i}`}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Hiển thị error message khi có lỗi và không có dữ liệu hợp lệ
  if (error && !hasValidData) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800 dark:text-yellow-200">
            {language === "vi"
              ? "Đang sử dụng dữ liệu mẫu do lỗi kết nối API"
              : "Using sample data due to API connection error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

export default MarketOverview;
