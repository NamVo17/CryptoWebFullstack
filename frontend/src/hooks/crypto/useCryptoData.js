import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCryptoData, fetchGlobalData } from '../../store/slices/cryptoSlice';

const useCryptoData = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { cryptoData, globalData } = useSelector(state => state.crypto);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        dispatch(fetchCryptoData()),
        dispatch(fetchGlobalData())
      ]);
    } catch (error) {
      setError(error.message || 'Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    // Fetch data ngay lập tức khi component mount
    fetchData();

    // Set interval để fetch lại sau mỗi 5 phút
    const interval = setInterval(fetchData, 300000);

    // Cleanup interval khi unmount
    return () => clearInterval(interval);
  }, [fetchData]);
};

export default useCryptoData;
