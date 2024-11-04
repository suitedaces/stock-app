import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const INDEX_MAP: Record<string, string> = {
  '^GSPC': 'SPX',
  '^DJI': 'DJI',
  '^IXIC': 'IXIC'
};

export function getTradingViewUrl(symbol: string): string {
  if (symbol.startsWith('^')) {
    return `https://www.tradingview.com/chart/?symbol=${INDEX_MAP[symbol] || symbol.slice(1)}`;
  }
  return `https://www.tradingview.com/chart/?symbol=${symbol}`;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
