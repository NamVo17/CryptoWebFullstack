import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cryptoAPI } from "../services/api";

// Async thunks with better error handling
export const fetchCryptoData = createAsyncThunk(
  "crypto/fetchCryptoData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching crypto data...");
      const response = await cryptoAPI.getCoins();
      console.log(
        "Crypto data fetched successfully:",
        response.data?.length,
        "coins"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch crypto data:", error);
      return rejectWithValue(error.message || "Failed to fetch crypto data");
    }
  }
);


export const fetchGlobalData = createAsyncThunk(
  "crypto/fetchGlobalData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching global data...");
      const response = await cryptoAPI.getGlobalData();
      console.log("Global data fetched successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch global data:", error);
      return rejectWithValue(error.message || "Failed to fetch global data");
    }
  }
);

export const fetchCoinDetail = createAsyncThunk(
  "crypto/fetchCoinDetail",
  async (coinId, { rejectWithValue }) => {
    try {
      console.log("Fetching coin detail for:", coinId);
      const response = await cryptoAPI.getCoinDetail(coinId);
      console.log("Coin detail fetched successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch coin detail:", error);
      return rejectWithValue(error.message || "Failed to fetch coin detail");
    }
  }
);

export const fetchCoinChart = createAsyncThunk(
  "crypto/fetchCoinChart",
  async ({ coinId, days = 7 }, { rejectWithValue }) => {
    try {
      console.log("Fetching chart data for:", coinId, "days:", days);
      const response = await cryptoAPI.getCoinChart(coinId, days);
      console.log("Chart data fetched successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
      return rejectWithValue(error.message || "Failed to fetch chart data");
    }
  }
);

const getInitialWatchlist = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("crypto-watchlist") || "[]");
  } catch {
    return [];
  }
};

const getInitialAlerts = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("crypto-alerts") || "[]");
  } catch {
    return [];
  }
};

const initialState = {
  // Data
  coins: [],
  globalData: {
    total_market_cap: { usd: 0 },
    total_volume: { usd: 0 },
    market_cap_percentage: { btc: 0 },
    active_cryptocurrencies: 0,
    market_cap_change_percentage_24h_usd: 0,
  },
  selectedCoin: null,
  chartData: null,

  // Cache timestamps
  lastUpdated: null,
  globalLastUpdated: null,

  // Loading states
  loading: false,
  globalLoading: false,

  // Error states
  error: null,
  globalError: null,

  // User data
  watchlist: getInitialWatchlist(),
  priceAlerts: getInitialAlerts(),

  // UI state
  filters: {
    search: "",
    sortBy: "market_cap_rank",
    sortOrder: "asc",
    category: "all",
  },
  
};

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    // Watchlist actions
    addToWatchlist: (state, action) => {
      const coinId = action.payload;
      if (!state.watchlist.includes(coinId)) {
        state.watchlist.push(coinId);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "crypto-watchlist",
            JSON.stringify(state.watchlist)
          );
        }
      }
    },
    removeFromWatchlist: (state, action) => {
      const coinId = action.payload;
      state.watchlist = state.watchlist.filter((id) => id !== coinId);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "crypto-watchlist",
          JSON.stringify(state.watchlist)
        );
      }
    },

    // Price alerts
    addPriceAlert: (state, action) => {
      const alert = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        active: true,
      };
      state.priceAlerts.push(alert);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "crypto-alerts",
          JSON.stringify(state.priceAlerts)
        );
      }
    },
    removePriceAlert: (state, action) => {
      const alertId = action.payload;
      state.priceAlerts = state.priceAlerts.filter(
        (alert) => alert.id !== alertId
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "crypto-alerts",
          JSON.stringify(state.priceAlerts)
        );
      }
    },
    togglePriceAlert: (state, action) => {
      const alertId = action.payload;
      const alert = state.priceAlerts.find((alert) => alert.id === alertId);
      if (alert) {
        alert.active = !alert.active;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "crypto-alerts",
            JSON.stringify(state.priceAlerts)
          );
        }
      }
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch crypto data
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = !state.coins.length; // Only show loading if we don't have any data
        state.error = null;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.length > 0) {
          state.coins = action.payload;
        }
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch crypto data";
        console.error("Crypto data fetch rejected:", action.payload);
      })

      // Fetch global data
      .addCase(fetchGlobalData.pending, (state) => {
        // Don't set loading if we already have data
        if (!state.globalData?.total_market_cap?.usd) {
          state.globalLoading = true;
        }
      })
      .addCase(fetchGlobalData.fulfilled, (state, action) => {
        state.globalLoading = false;
        if (action.payload && action.payload.data) {
          // Update with new data structure from API
          const data = action.payload.data;
          state.globalData = {
            total_market_cap: data.total_market_cap || { usd: 0 },
            total_volume: data.total_volume || { usd: 0 },
            market_cap_percentage: data.market_cap_percentage || { btc: 0 },
            active_cryptocurrencies: data.active_cryptocurrencies || 0,
            market_cap_change_percentage_24h_usd:
              data.market_cap_change_percentage_24h_usd || 0,
          };
          state.globalLastUpdated = Date.now();
          state.globalError = null;
        }
      })
      .addCase(fetchGlobalData.rejected, (state, action) => {
        state.globalLoading = false;
        state.globalError = action.payload;
        // Keep existing data if available
        if (!state.globalData?.total_market_cap?.usd) {
          state.globalData = initialState.globalData;
        }
        console.error("Global data fetch rejected:", action.payload);
      })

      // Fetch coin detail
      .addCase(fetchCoinDetail.fulfilled, (state, action) => {
        state.selectedCoin = action.payload;
      })
      .addCase(fetchCoinDetail.rejected, (state, action) => {
        console.error("Coin detail fetch rejected:", action.payload);
      })

      // Fetch chart data
      .addCase(fetchCoinChart.fulfilled, (state, action) => {
        state.chartData = action.payload;
      })
      .addCase(fetchCoinChart.rejected, (state, action) => {
        console.error("Chart data fetch rejected:", action.payload);
      })
      
  },
});

export const {
  addToWatchlist,
  removeFromWatchlist,
  addPriceAlert,
  removePriceAlert,
  togglePriceAlert,
  setFilters,
  resetFilters,
  clearError,
} = cryptoSlice.actions;

export default cryptoSlice.reducer;
