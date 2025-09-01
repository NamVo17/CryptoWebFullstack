import React from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

export const SessionManager = () => {
  // Initialize auto refresh
  useAutoRefresh();
  
  // This component doesn't render anything
  return null;
};



