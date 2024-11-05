export const CACHE_DURATION = 60000; // 1 minute in milliseconds

export interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const CACHE_KEYS = {
    WATCHLIST: 'watchlist',
    WATCHLIST_DATA: 'watchlistData',
    MARKET_INDEX: 'marketIndexData'
  } as const;
  
  

// returns null if the cache is expired (CACHE_DURATION) or the data is not in the cache
export function getCachedData<T>(key: string): T | null {
  try {
    const cachedString = localStorage.getItem(key);
    if (!cachedString) return null;

    const cached: CacheData<T> = JSON.parse(cachedString);
    const now = Date.now();

    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
} 