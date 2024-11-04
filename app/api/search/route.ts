import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

type YahooSearchQuote = {
  exchange?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  symbol: string;
  index?: string;
  score?: number;
  typeDisp?: string;
  longtype?: string;
  isYahooFinance?: boolean;
  sector?: string;
  industry?: string;
  dispSecIndFlag?: boolean;
  name?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results = await yahooFinance.search(query, {
      quotesCount: 20,
      newsCount: 0,
    });

    // Transform and filter the results
    const searchResults: SearchResult[] = (results.quotes as YahooSearchQuote[])
      .filter(quote => 
        quote.typeDisp === 'Equity' || quote.quoteType === 'EQUITY'
      )
      .map(quote => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.name || '',
        exchange: quote.exchange || '',
        type: quote.typeDisp || quote.quoteType || 'EQUITY',
      }))
      // Sort to prioritize US exchanges
      .sort((a, b) => {
        const isUSExchangeA = isUSExchange(a.exchange);
        const isUSExchangeB = isUSExchange(b.exchange);
        if (isUSExchangeA && !isUSExchangeB) return -1;
        if (!isUSExchangeA && isUSExchangeB) return 1;
        return 0;
      });

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}

function isUSExchange(exchange: string): boolean {
  const usExchanges = [
    'NYSE', 'NASDAQ', 'AMEX',
    'NY', 'NAS', 'NYQ', 'NGS', 'NMS',
    'PCX', 'BSE', 'NCM', 'NGM'
  ];
  return usExchanges.some(e => exchange?.toUpperCase().includes(e));
} 