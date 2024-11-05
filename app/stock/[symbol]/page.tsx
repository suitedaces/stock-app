'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createChart, ColorType } from 'lightweight-charts';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { formatPrice } from '@/lib/utils';
import { getCachedData, setCachedData } from '@/lib/cache';

interface ChartData {
  time: string;
  value: number;
}

type TimeRange = '1D' | '1M' | '3M' | '6M' | '1Y';

const TIME_RANGES: { [key in TimeRange]: number } = {
  '1D': 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
  '3M': 90 * 24 * 60 * 60 * 1000,
  '6M': 180 * 24 * 60 * 60 * 1000,
  '1Y': 365 * 24 * 60 * 60 * 1000,
};

export default function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const decodedSymbol = decodeURIComponent(resolvedParams.symbol);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<{ change: number; changePercent: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getCacheKey = (range: TimeRange) => `stock_history_${decodedSymbol}_${range}`;

  const fetchHistoricalData = async (range: TimeRange) => {
    try {
      setIsLoading(true);

      // Try to get cached data first
      const cacheKey = getCacheKey(range);
      const cachedData = getCachedData<ChartData[]>(cacheKey);
      
      if (cachedData) {
        setChartData(cachedData);
        if (cachedData.length > 0) {
          const latestPrice = cachedData[cachedData.length - 1].value;
          const firstPrice = cachedData[0].value;
          setCurrentPrice(latestPrice);
          setPriceChange({
            change: latestPrice - firstPrice,
            changePercent: ((latestPrice - firstPrice) / firstPrice) * 100,
          });
        }
        setIsLoading(false);
        return;
      }

      // If no cached data or cache is expired, fetch from API
      const period1 = new Date(Date.now() - TIME_RANGES[range]);
      const response = await fetch(
        `/api/stocks/history?symbol=${resolvedParams.symbol}&period1=${period1.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data = await response.json();
      
      // Cache the new data
      setCachedData(cacheKey, data);
      
      setChartData(data);
      if (data.length > 0) {
        const latestPrice = data[data.length - 1].value;
        const firstPrice = data[0].value;
        setCurrentPrice(latestPrice);
        setPriceChange({
          change: latestPrice - firstPrice,
          changePercent: ((latestPrice - firstPrice) / firstPrice) * 100,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData(selectedRange);
  }, [resolvedParams.symbol, selectedRange]);

  useEffect(() => {
    if (!chartData.length || isLoading) return;

    const chartContainer = document.getElementById('chart');
    if (!chartContainer) return;

    // Clear previous chart if any
    chartContainer.innerHTML = '';

    const newChart = createChart(chartContainer, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      width: chartContainer.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const lineSeries = newChart.addLineSeries({
      color: priceChange?.change && priceChange.change >= 0 ? '#22c55e' : '#ef4444',
      lineWidth: 2,
    });

    lineSeries.setData(chartData);

    const handleResize = () => {
      newChart.applyOptions({ width: chartContainer.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
    };
  }, [chartData, isLoading, priceChange?.change]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{decodedSymbol}</CardTitle>
            {currentPrice && priceChange && (
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  {formatPrice(currentPrice)}
                </div>
                <div className={`text-sm font-medium ${
                  priceChange.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {priceChange.change >= 0 ? '+' : ''}
                  {formatPrice(priceChange.change)} ({priceChange.changePercent.toFixed(2)}%)
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(Object.keys(TIME_RANGES) as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={selectedRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              ← Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <div id="chart" className="w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 