"use client"

import { Provider } from "react-redux"
import { store } from "../store/store"
import { ThemeProvider } from "./ThemeProvider"

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  )
}
