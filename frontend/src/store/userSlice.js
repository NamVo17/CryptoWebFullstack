import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  portfolio: [],
  accessToken: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.portfolio = []
      state.accessToken = null
    },
    clearError: (state) => {
      state.error = null
    },
    updatePortfolio: (state, action) => {
      state.portfolio = action.payload
    },
    addToPortfolio: (state, action) => {
      const existingIndex = state.portfolio.findIndex((item) => item.coinId === action.payload.coinId)
      if (existingIndex >= 0) {
        state.portfolio[existingIndex] = action.payload
      } else {
        state.portfolio.push(action.payload)
      }
    },
    removeFromPortfolio: (state, action) => {
      state.portfolio = state.portfolio.filter((item) => item.coinId !== action.payload)
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updatePortfolio,
  addToPortfolio,
  removeFromPortfolio,
} = userSlice.actions

export default userSlice.reducer
