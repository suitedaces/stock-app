import { useState, useEffect } from 'react';
import { StockData } from '@/types';

export const INDICES = ['^GSPC', '^DJI', '^IXIC'] as const;

export function useMarketData() {
  const [data, setData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/stocks?symbols=${INDICES.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch market data');
        const marketData = await response.json();
        setData(marketData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { data, error, isLoading };
} 