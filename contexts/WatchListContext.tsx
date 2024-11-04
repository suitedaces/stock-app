'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { StockData, CACHE_DURATION, CACHE_KEYS } from '@/lib/types';

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
  const [watchList, setWatchList] = useLocalStorage<string[]>(CACHE_KEYS.WATCHLIST, []);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = useCallback(async () => {
    if (watchList.length === 0) {
      setStocks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stocks?symbols=${watchList.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      
      const data: StockData[] = await response.json();
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  }, [watchList]);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const addToWatchList = async (symbol: string) => {
    if (!watchList.includes(symbol)) {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/stocks?symbols=${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch stock data');
        
        const data: StockData[] = await response.json();
        if (data.length === 0) throw new Error(`Invalid stock symbol: ${symbol}`);
        
        setStocks(prev => [...prev, data[0]]);
        setWatchList(prev => [...prev, symbol]);
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to add ${symbol} to watchlist`;
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeFromWatchList = (symbol: string) => {
    setWatchList(prev => prev.filter(s => s !== symbol));
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
  };

  return (
    <WatchListContext.Provider
      value={{
        watchList,
        stocks,
        addToWatchList,
        removeFromWatchList,
        isLoading,
        error
      }}
    >
      {children}
    </WatchListContext.Provider>
  );
}

export const useWatchList = () => {
  const context = useContext(WatchListContext);
  if (context === undefined) {
    throw new Error('useWatchList must be used within a WatchListProvider');
  }
  return context;
}; 