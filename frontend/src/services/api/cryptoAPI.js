import axios from 'axios';
import { cacheManager, CACHE_KEYS } from '../../utils/cache/cacheManager';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Increase timeout to 30 seconds
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log(`Making request to ${config.url}`, config);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url}:`, response);
    return response;
  },
  error => {
    console.error('API call failed:', error.config.url, error);
    return Promise.reject(error);
  }
);

// Mock fallback data
const mockGlobalData = {
  data: {
    active_cryptocurrencies: 2849,
    markets: 642,
    total_market_cap: { usd: 1847392847392 },
    total_volume: { usd: 83847392847 },
    market_cap_percentage: { btc: 47.5, eth: 18.2 },
    market_cap_change_percentage_24h_usd: 2.5,
  },
};

const mockCoinsData = [
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
  },
];

// Helper function to handle API calls with caching
const withCache = async (cacheKey, apiCall, mockData = null) => {
  try {
    // Check cache first
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return { data: cachedData };
    }

    // If not in cache, make API call
    console.log(`Fetching fresh data for ${cacheKey}`);
    const response = await apiCall();
    
    // Cache the successful response
    if (response.data) {
      await cacheManager.set(cacheKey, response.data, 300);
    }
    return response;

  } catch (error) {
    console.error(`API Error for ${cacheKey}:`, error);

    // If we have mock data, use it as last resort
    if (mockData) {
      console.log(`Using mock data for ${cacheKey}`);
      return { data: mockData };
    }

    throw error;
  }
};

export const cryptoAPI = {
  getCoins: (params = {}) => 
    withCache(
      CACHE_KEYS.COINS_DATA,
      async () => {
        const response = await api.get('/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 250,
            page: 1,
            sparkline: false,
            price_change_percentage: '1h,24h,7d',
            ...params
          }
        });
        return response;
      },
      mockCoinsData
    ),

  getGlobalData: () =>
    withCache(
      CACHE_KEYS.GLOBAL_DATA,
      async () => {
        const response = await api.get('/global');
        return response;
      },
      mockGlobalData
    ),

  getCoinDetail: (coinId) =>
    withCache(
      `${CACHE_KEYS.COIN_DETAIL}_${coinId}`,
      async () => {
        const response = await api.get(`/coins/${coinId}`, {
          params: {
            localization: false,
            tickers: true,
            market_data: true,
            community_data: true,
            developer_data: true,
            sparkline: true
          }
        });
        
        if (!response.data) {
          throw new Error('No data received from API');
        }
        
        return response;
      },
      mockCoinsData[0]  // Use the first mock coin as fallback
    ),

  getCoinChart: (coinId, days = 1) =>
    withCache(
      `${CACHE_KEYS.COIN_CHART}_${coinId}_${days}`,
      async () => {
        const response = await api.get(`/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: days
          }
        });
        return response;
      },
      {
        prices: Array.from({ length: days }, (_, i) => [
          Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000,
          Math.random() * 50000
        ]),
        market_caps: [],
        total_volumes: []
      }
    )
};
