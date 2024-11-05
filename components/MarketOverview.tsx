'use client';

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useMarketData, INDICES } from '@/hooks/useMarketData';
import { formatPrice, INDEX_MAP, getEncodedSymbol } from '@/lib/utils';
import Link from 'next/link';

export default function MarketOverview() {
  const { data, error, isLoading } = useMarketData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INDICES.map((index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((index) => (
        <Card key={index.symbol}>
          <CardContent className="p-6">
            <Link
              href={`/stock/${getEncodedSymbol(index.symbol)}`}
              className="hover:underline"
            >
              <h3 className="text-lg font-semibold">
                {INDEX_MAP[index.symbol]}
              </h3>
            </Link>
            <p className="text-2xl font-bold mt-2">
              {formatPrice(index.price)}
            </p>
            <p className={`flex items-center mt-1 ${
              index.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {index.change >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span>{Math.abs(index.change).toFixed(2)}</span>
              <span className="ml-2">({index.changePercent.toFixed(2)}%)</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 