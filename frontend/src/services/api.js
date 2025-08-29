import axios from "axios";
import { cacheManager, CACHE_KEYS } from "../utils/cacheManager";

const BASE_URL = "https://api.coingecko.com/api/v3";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Mock data for fallback
const mockGlobalData = {
  data: {
    active_cryptocurrencies: 10000,
    markets: 642,
    total_market_cap: {
      usd: 1847392847392,
    },
    total_volume: {
      usd: 83847392847,
    },
    market_cap_percentage: {
      btc: 47.5,
      eth: 18.2,
    },
    market_cap_change_percentage_24h_usd: 2.5,
  },
};

const mockCoinsData = {
  data: [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 43250.5,
      market_cap: 847392847392,
      market_cap_rank: 1,
      fully_diluted_valuation: 908392847392,
      total_volume: 23847392847,
      high_24h: 44100.25,
      low_24h: 42800.75,
      price_change_24h: 1250.5,
      price_change_percentage_24h: 2.98,
      price_change_percentage_1h_in_currency: 0.25,
      price_change_percentage_7d_in_currency: -1.15,
      market_cap_change_24h: 24847392847,
      market_cap_change_percentage_24h: 3.02,
      circulating_supply: 19600000,
      total_supply: 21000000,
      max_supply: 21000000,
      last_updated: new Date().toISOString(),
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 2650.75,
      market_cap: 318472847392,
      market_cap_rank: 2,
      fully_diluted_valuation: 318472847392,
      total_volume: 15847392847,
      high_24h: 2720.5,
      low_24h: 2580.25,
      price_change_24h: 85.25,
      price_change_percentage_24h: 3.32,
      price_change_percentage_1h_in_currency: 0.45,
      price_change_percentage_7d_in_currency: 2.15,
      market_cap_change_24h: 10247392847,
      market_cap_change_percentage_24h: 3.33,
      circulating_supply: 120280000,
      total_supply: 120280000,
      max_supply: null,
      last_updated: new Date().toISOString(),
    }
  ]
};

const mockChartData = {
  prices: Array.from({ length: 7 }, (_, i) => [
    Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
    Math.random() * 50000
  ]),
  market_caps: Array.from({ length: 7 }, (_, i) => [
    Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
    Math.random() * 1000000000000
  ]),
  total_volumes: Array.from({ length: 7 }, (_, i) => [
    Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
    Math.random() * 100000000000
  ])
};

// Helper function to handle API calls with caching
const withCache = async (cacheKey, apiCall, mockData = null) => {
  try {
    // Check cache first
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }

    // If not in cache, make API call
    console.log(`Fetching fresh data for ${cacheKey}`);
    const response = await apiCall();
    
    // Cache the successful response
    cacheManager.set(cacheKey, response);
    return response;

  } catch (error) {
    console.error(`API Error for ${cacheKey}:`, error);

    // If we have cached data, use it despite being expired
    const expiredCache = cacheManager.cache.get(cacheKey);
    if (expiredCache) {
      console.log(`Using expired cache for ${cacheKey}`);
      return expiredCache.data;
    }

    // If we have mock data, use it as last resort
    if (mockData) {
      console.log(`Using mock data for ${cacheKey}`);
      return mockData;
    }

    throw error;
  }
};

export const cryptoAPI = {
  getGlobalData: () =>
    withCache(
      CACHE_KEYS.GLOBAL_DATA,
      () => api.get("/global"),
      mockGlobalData
    ),

  getCoins: (params = {}) =>
    withCache(
      CACHE_KEYS.COINS_DATA,
      () =>
        api.get("/coins/markets", {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 250,
            sparkline: true,
            price_change_percentage: "1h,24h,7d",
            ...params,
          },
        }),
      mockCoinsData
    ),

  getCoinDetail: (coinId) =>
    withCache(
      CACHE_KEYS.COIN_DETAIL(coinId),
      () =>
        api.get(`/coins/${coinId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: true,
          },
        }),
      { data: mockCoinsData.data.find(coin => coin.id === coinId) || mockCoinsData.data[0] }
    ),

  getCoinChart: (coinId, days = 7) =>
    withCache(
      CACHE_KEYS.COIN_CHART(coinId, days),
      () =>
        api.get(`/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: "usd",
            days: days,
          },
        }),
      { data: mockChartData }
    ),

  searchCoins: async (query) =>
    withCache(
      CACHE_KEYS.SEARCH(query),
      () => api.get("/search", { params: { query } }),
      { data: { coins: mockCoinsData.data.slice(0, 3) } }
    ),
};

export default api;
