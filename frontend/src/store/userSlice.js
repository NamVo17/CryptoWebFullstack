import { createSlice } from "@reduxjs/toolkit"

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

const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  loading: false,
  error: null,
  portfolio: getInitialPortfolio(loadUserFromStorage()?.id),
  balance: getInitialBalance(),
  accessToken: loadTokenFromStorage(),
  sessionExpiry: getSessionExpiry(),
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    loginSuccess: (state, action) => {
      console.log('🔍 Processing login success:', action.payload);
      
      state.loading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      
      // Handle user data
      if (action.payload.user) {
        const userData = action.payload.user;
        
        // Ensure balance exists
        const userBalance = userData.balance || {
          usdt: 1000,
          btc: 0,
          eth: 0
        };
        
        console.log('💰 Using balance:', userBalance);
        
        // Update state with complete user data
        state.user = {
          ...userData,
          balance: userBalance
        };
        state.balance = userBalance;
        
        // Save to localStorage
        try {
          localStorage.setItem('user', JSON.stringify(state.user));
          localStorage.setItem('accessToken', action.payload.accessToken);
          localStorage.setItem('crypto-balance', JSON.stringify(userBalance));
          
          // Set session expiry
          const expiryTime = new Date().getTime() + (15 * 60 * 1000);
          localStorage.setItem('session-expiry', expiryTime.toString());
          state.sessionExpiry = expiryTime.toString();
          
          console.log('✅ Data saved to localStorage');
        } catch (err) {
          console.error('❌ Error saving to localStorage:', err);
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
      
      if (typeof window !== "undefined") {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('crypto-balance');
        localStorage.removeItem('session-expiry');
      }
    },

    registerSuccess: (state, action) => {
      state.loading = false;
      state.error = null;

      if (action.payload?.user) {
        const user = action.payload.user;
        
        // Ensure user has balance
        const userWithBalance = {
          ...user,
          balance: user.balance || {
            usdt: 1000,
            btc: 0,
            eth: 0
          }
        };
        
        console.log('💰 Registration data with balance:', userWithBalance);
        
        // Store complete user data including balance
        localStorage.setItem('temp_registered_user', JSON.stringify(userWithBalance));
        if (userWithBalance.balance) {
          console.log('💰 Saving initial balance:', userWithBalance.balance);
          localStorage.setItem('temp_registered_balance', JSON.stringify(userWithBalance.balance));
        }
        
        // Update state
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
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.user.balance) {
          localStorage.setItem('crypto-balance', JSON.stringify(action.payload.user.balance));
        }
      }
      localStorage.setItem('accessToken', action.payload.accessToken);
      const expiryTime = new Date().getTime() + (15 * 60 * 1000);
      localStorage.setItem('session-expiry', expiryTime.toString());
      state.sessionExpiry = expiryTime.toString();
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.sessionExpiry = null;
      state.balance = null;
      
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('crypto-balance');
      localStorage.removeItem('session-expiry');
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
      state.portfolio = state.portfolio.filter(item => item.id !== action.payload);
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
      // This reducer is used to trigger logout when session expires
      // The actual logout logic is handled in the component
    }
  }
});

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
