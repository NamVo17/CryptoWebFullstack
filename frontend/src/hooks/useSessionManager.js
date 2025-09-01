import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, refreshSession, checkSessionExpiry } from '../store/userSlice';

const API_BASE = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || "http://localhost:4000";

export const useSessionManager = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, sessionExpiry, accessToken } = useSelector((state) => state.user);
  const refreshTimeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(refreshSession({ accessToken: data.accessToken }));
      } else {
        // Refresh failed, logout user
        dispatch(logout());
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch(logout());
    }
  };

  // Function to check session expiry
  const checkExpiry = () => {
    if (sessionExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(sessionExpiry);
      const timeUntilExpiry = expiry - now;

      if (timeUntilExpiry <= 0) {
        // Session expired
        dispatch(logout());
      } else if (timeUntilExpiry <= 5 * 60 * 1000) {
        // Less than 5 minutes left, refresh token
        refreshToken();
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && sessionExpiry) {
      // Check session expiry every minute
      checkIntervalRef.current = setInterval(() => {
        dispatch(checkSessionExpiry());
        checkExpiry();
      }, 60 * 1000);

      // Set up refresh timeout
      const now = new Date().getTime();
      const expiry = parseInt(sessionExpiry);
      const timeUntilExpiry = expiry - now;

      if (timeUntilExpiry > 5 * 60 * 1000) {
        // More than 5 minutes left, set timeout to refresh
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken();
        }, timeUntilExpiry - 5 * 60 * 1000);
      } else if (timeUntilExpiry > 0) {
        // Less than 5 minutes left, refresh immediately
        refreshToken();
      } else {
        // Already expired
        dispatch(logout());
      }
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, sessionExpiry, dispatch]);

  // Check session on page load/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        dispatch(checkSessionExpiry());
        checkExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isAuthenticated, dispatch]);

  return {
    refreshToken,
    checkExpiry,
  };
};


