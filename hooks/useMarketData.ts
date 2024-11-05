import { useState, useEffect } from 'react';
import { StockData } from '@/lib/types';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/lib/cache';

export const INDICES = ['^GSPC', '^DJI', '^IXIC'] as const;

export function useMarketData() {
  const [data, setData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndCacheData = async () => {
    try {
      const response = await fetch(`/api/stocks?symbols=${INDICES.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      const marketData: StockData[] = await response.json();
      
      // Cache the new data
      setCachedData(CACHE_KEYS.MARKET_INDEX, marketData);
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Try to get cached data first
      const cachedData = getCachedData<StockData[]>(CACHE_KEYS.MARKET_INDEX);
      
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
      } else {
        // If no cache or expired, fetch new data
        await fetchAndCacheData();
      }
    };

    loadData();
    
    // Set up polling interval
    const interval = setInterval(fetchAndCacheData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { data, error, isLoading };
} 