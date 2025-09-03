// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired (5 minutes)
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  // Get time until next refresh in milliseconds
  getTimeUntilRefresh(key) {
    const cached = this.cache.get(key);
    if (!cached) return 0;
    
    const timeSinceCache = Date.now() - cached.timestamp;
    return Math.max(0, CACHE_DURATION - timeSinceCache);
  }
}

export const cacheManager = new CacheManager();

// Cache keys
export const CACHE_KEYS = {
  GLOBAL_DATA: 'globalData',
  COINS_DATA: 'coinsData',
  COIN_DETAIL: (id) => `coinDetail_${id}`,
  COIN_CHART: (id, days) => `coinChart_${id}_${days}`,
};
