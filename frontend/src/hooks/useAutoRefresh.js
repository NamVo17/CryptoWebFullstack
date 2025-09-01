import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenSuccess, logout } from '../store/userSlice';

export const useAutoRefresh = () => {
  const dispatch = useDispatch();
  const { accessToken, sessionExpiry } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || "http://localhost:4000";
        
        // If no token or session expiry, logout
        if (!accessToken || !sessionExpiry) {
          dispatch(logout());
          return;
        }

        // If session hasn't expired, don't refresh
        if (new Date().getTime() < parseInt(sessionExpiry)) {
          return;
        }

        // Attempt to refresh the token
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Refresh failed');
        }

        const data = await response.json();
        dispatch(refreshTokenSuccess(data));
      } catch (error) {
        console.error('Token refresh failed:', error);
        dispatch(logout());
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Set up periodic checks
    const intervalId = setInterval(checkAndRefreshToken, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [dispatch, accessToken, sessionExpiry]);
};
