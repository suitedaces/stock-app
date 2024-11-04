'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useWatchList } from '@/contexts/WatchListContext';
import { SearchResult } from '@/types/stock';
import { getTradingViewUrl } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area"

export default function StockSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { watchList, addToWatchList, isLoading: isAddingToWatchList } = useWatchList();
  
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search stocks');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddToWatchList = async (symbol: string) => {
    try {
      await addToWatchList(symbol);
      setQuery('');
      setResults([]);
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search stocks by symbol or company name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      {(results.length > 0 || error || (query && !loading)) && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-background border rounded-md shadow-lg">
          {error && (
            <p className="text-sm text-destructive p-3">
              {error}
            </p>
          )}
          
          <ScrollArea className="max-h-[300px]">
            <div className="p-2 space-y-2">
              {results.map((result) => (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <a
                        href={getTradingViewUrl(result.symbol)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold hover:underline truncate"
                      >
                        {result.symbol}
                      </a>
                      <span className="text-muted-foreground truncate">
                        {result.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.exchange}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddToWatchList(result.symbol)}
                    variant={watchList.includes(result.symbol) ? "secondary" : "default"}
                    size="sm"
                    disabled={isAddingToWatchList}
                    className="ml-2 whitespace-nowrap"
                  >
                    {watchList.includes(result.symbol) ? 'Added' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {query && results.length === 0 && !loading && !error && (
            <p className="text-muted-foreground p-3">
              No results found for &quot;{query}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
} 