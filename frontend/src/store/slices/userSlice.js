import { createSlice } from "@reduxjs/toolkit";

// ===== Helpers =====
const getInitialPortfolio = (userId) => {
  if (typeof window === "undefined" || !userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`crypto-portfolio-${userId}`) || "[]");
  } catch {
    return [];
  }
};

const getInitialBalance = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("crypto-balance") || "null");
  } catch {
    return null;
  }
};

const getSessionExpiry = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("session-expiry");
  } catch {
    return null;
  }
};

const loadUserFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const loadTokenFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

// ===== Initial State =====
const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  hasUser: !!loadUserFromStorage(),
  hasToken: !!loadTokenFromStorage(),
  balance: getInitialBalance(),
  portfolio: getInitialPortfolio(loadUserFromStorage()?.id),
  accessToken: loadTokenFromStorage(),
  sessionExpiry: getSessionExpiry(),
  loading: false,
  error: null,
};

// ===== Slice =====
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      console.log("🔍 Processing login success:", action.payload);

      state.loading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;

      if (action.payload.user) {
        const userData = action.payload.user;

        // Ensure balance exists
        const userBalance = userData.balance || { usdt: 1000, btc: 0, eth: 0 };

        // Update state
        state.user = { ...userData, balance: userBalance };
        state.balance = userBalance;

        // Save to localStorage
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("crypto-balance", JSON.stringify(userBalance));

          const expiryTime = new Date().getTime() + 15 * 60 * 1000; // 15 phút
          localStorage.setItem("session-expiry", expiryTime.toString());
          state.sessionExpiry = expiryTime.toString();

          console.log("✅ Data saved to localStorage");
        } catch (err) {
          console.error("❌ Error saving to localStorage:", err);
        }

        // Load user-specific portfolio
        state.portfolio = getInitialPortfolio(userData.id);
      }
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.balance = null;
      state.portfolio = [];

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("crypto-balance");
        localStorage.removeItem("session-expiry");
      }
    },

    logout: (state) => {
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.balance = null;
      state.portfolio = [];
      state.sessionExpiry = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("crypto-balance");
        localStorage.removeItem("session-expiry");
        if (state.user?.id) {
          localStorage.removeItem(`crypto-portfolio-${state.user.id}`);
        }
      }
    },

    registerSuccess: (state, action) => {
      state.loading = false;
      state.error = null;

      if (action.payload?.user) {
        const user = action.payload.user;
        const userWithBalance = {
          ...user,
          balance: user.balance || { usdt: 1000, btc: 0, eth: 0 },
        };

        console.log("💰 Registration data with balance:", userWithBalance);

        localStorage.setItem("temp_registered_user", JSON.stringify(userWithBalance));
        localStorage.setItem("temp_registered_balance", JSON.stringify(userWithBalance.balance));

        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.balance = userWithBalance.balance;
      }
    },

    refreshTokenSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) {
        state.user = action.payload.user;
        state.balance = action.payload.user.balance;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.user.balance) {
          localStorage.setItem("crypto-balance", JSON.stringify(action.payload.user.balance));
        }
      }
      localStorage.setItem("accessToken", action.payload.accessToken);
      const expiryTime = new Date().getTime() + 15 * 60 * 1000;
      localStorage.setItem("session-expiry", expiryTime.toString());
      state.sessionExpiry = expiryTime.toString();
    },

    clearError: (state) => {
      state.error = null;
    },

    updatePortfolio: (state, action) => {
      state.portfolio = action.payload;
      if (typeof window !== "undefined" && state.user?.id) {
        localStorage.setItem(`crypto-portfolio-${state.user.id}`, JSON.stringify(state.portfolio));
      }
    },

    addToPortfolio: (state, action) => {
      state.portfolio.push(action.payload);
      if (typeof window !== "undefined" && state.user?.id) {
        localStorage.setItem(`crypto-portfolio-${state.user.id}`, JSON.stringify(state.portfolio));
      }
    },

    removeFromPortfolio: (state, action) => {
      state.portfolio = state.portfolio.filter((item) => item.id !== action.payload);
      if (typeof window !== "undefined" && state.user?.id) {
        localStorage.setItem(`crypto-portfolio-${state.user.id}`, JSON.stringify(state.portfolio));
      }
    },

    updateBalance: (state, action) => {
      state.balance = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("crypto-balance", JSON.stringify(action.payload));
      }
    },

    refreshSession: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.sessionExpiry = action.payload.sessionExpiry;
      if (typeof window !== "undefined") {
        localStorage.setItem("session-expiry", action.payload.sessionExpiry);
      }
    },

    checkSessionExpiry: (state) => {
      // Chỉ dùng để trigger check từ component
    },
  },
});

// ===== Exports =====
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerSuccess,
  refreshTokenSuccess,
  logout,
  clearError,
  updatePortfolio,
  addToPortfolio,
  removeFromPortfolio,
  updateBalance,
  refreshSession,
  checkSessionExpiry,
} = userSlice.actions;

export default userSlice.reducer;
