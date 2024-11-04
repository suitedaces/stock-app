'use client';

import MarketOverview from '@/components/MarketOverview';
import StockSearch from '@/components/StockSearch';
import WatchList from '@/components/WatchList';
import { WatchListProvider } from '@/contexts/WatchListContext';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <WatchListProvider>
        <Suspense 
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 h-32 rounded-lg" />
              ))}
            </div>
          }
        >
          <MarketOverview />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>🔍 Stocks </CardTitle>
              </CardHeader>
              <CardContent>
                <StockSearch />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <WatchList />
          </div>
        </div>
      </WatchListProvider>
    </div>
  );
} 