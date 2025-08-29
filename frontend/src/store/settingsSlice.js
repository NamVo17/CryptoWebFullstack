import { createSlice } from "@reduxjs/toolkit"

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light"

  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) return savedTheme

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const initialState = {
  theme: getInitialTheme(),
  language: typeof window !== "undefined" ? localStorage.getItem("language") || "vi" : "vi",
  currency: "usd",
  notifications: {
    priceAlerts: true,
    marketUpdates: true,
    newsletter: false,
  },
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.theme)
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.theme)
      }
    },
    toggleLanguage: (state) => {
      state.language = state.language === "vi" ? "en" : "vi"
      if (typeof window !== "undefined") {
        localStorage.setItem("language", state.language)
      }
    },
    setLanguage: (state, action) => {
      state.language = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("language", state.language)
      }
    },
    setCurrency: (state, action) => {
      state.currency = action.payload
    },
    updateNotifications: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
  },
})

export const { toggleTheme, setTheme, toggleLanguage, setLanguage, setCurrency, updateNotifications } =
  settingsSlice.actions

export default settingsSlice.reducer
