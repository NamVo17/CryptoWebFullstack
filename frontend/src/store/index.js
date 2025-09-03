import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer, * as cryptoActions from './slices/cryptoSlice';
import settingsReducer, * as settingsActions from './slices/settingsSlice';
import userReducer, * as userActions from './slices/userSlice';

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    settings: settingsReducer,
    user: userReducer,
  },
});

// Re-export actions with namespaces to avoid conflicts
export const cryptoSlice = { ...cryptoActions };
export const settingsSlice = { ...settingsActions };
export const userSlice = { ...userActions };
