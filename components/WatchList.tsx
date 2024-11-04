'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Info } from "lucide-react"
import { useWatchList } from '@/contexts/WatchListContext';
import { getTradingViewUrl } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function WatchList() {
  const { stocks, removeFromWatchList, isLoading, error } = useWatchList();

  if (isLoading && stocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>🕵🏽‍♂️ Watchlist</CardTitle>
            <WatchlistInfo />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>🕵🏽‍♂️ Watchlist</CardTitle>
          <WatchlistInfo />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 p-4 rounded-md mb-4">
            <p className="text-destructive">{error}</p>
          </div>
        )}
        {stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <p className="text-muted-foreground mb-2">
              Your watchlist is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Search for stocks on the left to add them to your watchlist
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex justify-between items-center p-4 hover:bg-muted rounded-md transition-colors"
                >
                  <div>
                    <a
                      href={getTradingViewUrl(stock.symbol)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold hover:underline"
                    >
                      {stock.symbol}
                    </a>
                    <div className={`text-lg ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${stock.price.toFixed(2)}
                      <span className="ml-2">
                        ({stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromWatchList(stock.symbol)}
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistInfo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-0.5">
          <Info className="h-4 w-4" />
          <span className="sr-only">Watchlist Information</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <div className="space-y-2 text-xs">
          <p>
            <strong>Data Updates:</strong> Stock prices are refreshed every minute while you&apos;re viewing the page.
          </p>
          <p>
            <strong>Local Storage:</strong> Your watchlist is saved in your browser&apos;s local storage and persists between visits.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
} 