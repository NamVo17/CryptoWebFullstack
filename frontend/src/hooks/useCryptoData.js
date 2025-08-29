import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCryptoData, fetchGlobalData } from '../store/cryptoSlice';

// Custom hook để quản lý việc fetch crypto data
const useCryptoData = () => {
  const dispatch = useDispatch();

  // Tạo hàm fetchData để đảm bảo cả hai API được gọi đồng thời
  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchCryptoData()),
        dispatch(fetchGlobalData())
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
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
