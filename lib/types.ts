export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export type CacheData<T> = {
  [key: string]: {
    data: T;
    timestamp: number;
  };
};

export const CACHE_DURATION = 60000; // 1 minute in milliseconds

export const CACHE_KEYS = {
  WATCHLIST: 'watchlist',
  WATCHLIST_DATA: 'watchlistData',
  MARKET_INDEX: 'marketIndexData'
} as const; 