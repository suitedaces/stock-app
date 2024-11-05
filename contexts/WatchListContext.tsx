'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { StockData } from '@/lib/types';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/lib/cache';

interface WatchListContextType {
  watchList: string[];
  stocks: StockData[];
  addToWatchList: (symbol: string) => Promise<void>;
  removeFromWatchList: (symbol: string) => void;
  isLoading: boolean;
  error: string | null;
}

const WatchListContext = createContext<WatchListContextType | undefined>(undefined);

export function WatchListProvider({ children }: { children: React.ReactNode }) {
  const [watchList, setWatchList] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CACHE_KEYS.WATCHLIST);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (symbols: string[]) => {
    if (symbols.length === 0) {
      setStocks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/stocks?symbols=${symbols.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data = await response.json();
      
      // Cache the new data with the current symbols
      setCachedData(CACHE_KEYS.WATCHLIST_DATA, {
        symbols,
        data
      });
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchList = useCallback(async (symbol: string) => {
    if (!watchList.includes(symbol)) {
      const newWatchList = [...watchList, symbol];
      setWatchList(newWatchList);
      localStorage.setItem(CACHE_KEYS.WATCHLIST, JSON.stringify(newWatchList));
      setIsLoading(true);
      await fetchStockData(newWatchList);
    }
  }, [watchList]);

  const removeFromWatchList = useCallback((symbol: string) => {
    const newWatchList = watchList.filter(s => s !== symbol);
    setWatchList(newWatchList);
    localStorage.setItem(CACHE_KEYS.WATCHLIST, JSON.stringify(newWatchList));
    fetchStockData(newWatchList);
  }, [watchList]);

  useEffect(() => {
    const loadData = async () => {
      const cachedData = getCachedData<{ symbols: string[], data: StockData[] }>(CACHE_KEYS.WATCHLIST_DATA);
      
      if (cachedData && JSON.stringify(cachedData.symbols) === JSON.stringify(watchList)) {
        setStocks(cachedData.data);
        setIsLoading(false);
      } else {
        await fetchStockData(watchList);
      }
    };

    loadData();
    
    // Set up polling interval
    const interval = setInterval(() => {
      fetchStockData(watchList);
    }, 60000);

    return () => clearInterval(interval);
  }, [watchList]);

  return (
    <WatchListContext.Provider
      value={{
        watchList,
        stocks,
        addToWatchList,
        removeFromWatchList,
        isLoading,
        error,
      }}
    >
      {children}
    </WatchListContext.Provider>
  );
}

export function useWatchList() {
  const context = useContext(WatchListContext);
  if (context === undefined) {
    throw new Error('useWatchList must be used within a WatchListProvider');
  }
  return context;
} 