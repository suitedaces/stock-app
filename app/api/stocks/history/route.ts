import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

const getInterval = (period1: Date) => {
  const now = new Date();
  const diffDays = Math.ceil((now.getTime() - period1.getTime()) / (1000 * 60 * 60 * 24));
  
  // Valid intervals according to yahoo-finance2 docs
  if (diffDays <= 7) return '1m';     // 1-minute intervals for recent data
  if (diffDays <= 60) return '2m';    // 2-minute intervals for < 60 days
  if (diffDays <= 730) return '1d';   // daily intervals for < 2 years
  return '1wk';                       // weekly intervals for longer periods
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let symbol = searchParams.get('symbol') || '';
    const period1Str = searchParams.get('period1');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Handle index symbols
    if (symbol.includes('%5E')) {
      symbol = symbol.replace('%5E', '^');
    }

    const period1 = period1Str ? new Date(period1Str) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const period2 = new Date();

    // Ensure dates are valid
    if (isNaN(period1.getTime()) || isNaN(period2.getTime())) {
      throw new Error('Invalid date range');
    }

    // Ensure period1 is not in the future
    if (period1 > period2) {
      period1.setTime(period2.getTime() - 24 * 60 * 60 * 1000); // Set to 1 day ago
    }

    const interval = getInterval(period1);

    const queryOptions = {
      period1,
      period2,
      interval: interval as '1m' | '2m' | '1d' | '1wk', // Valid intervals only
      includePrePost: true, // Include pre/post market data
    };

    const result = await yahooFinance.chart(symbol, queryOptions);
    
    if (!result.quotes || result.quotes.length === 0) {
      throw new Error('No data available for this time range');
    }

    // Transform the data for the chart
    const chartData = result.quotes.map(quote => ({
      time: interval === '1d' || interval === '1wk'
        ? new Date(quote.date).toISOString().split('T')[0]
        : Math.floor(new Date(quote.date).getTime() / 1000), // Unix timestamp for intraday data
      value: quote.close,
    })).filter(item => item.value !== null);

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Historical data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
} 