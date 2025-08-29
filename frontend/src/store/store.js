import { configureStore } from "@reduxjs/toolkit"
import cryptoReducer from "./cryptoSlice"
import settingsReducer from "./settingsSlice"
import userReducer from "./userSlice"

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    settings: settingsReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})
