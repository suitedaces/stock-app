# Fintool - Simple Stock Tracker

**tl;dr**: Stock tracker web app for tracking and screening stocks

![1D820E3F-0D6E-4D9C-AA2D-E9070A0806B9_1_105_c](https://github.com/user-attachments/assets/e97d277c-c347-4c66-86a3-10d23fbe7837)

- Add/remove stocks from watchlist
- Real-time(ish) prices + daily charts
- Stock search by company/ticker
- Interactive price charts
- Zero auth, instant, free access - stores everything locally
- Built for speed-to-market

### Demo 

### 1. Where do I store the watch-list?
Browser's localStorage for v1. Reasons:
- 0 backend complexity
- Allows us to ship instantly
- Good enough for first users to gauge demand
Alternatively, I would add a simple backend with a Postgres database (supabase) to store the watchlist.

### 2. Do I need to manage auth?
No auth for v1. Instead:
- Use localStorage for watchlists
- Add newsletter signup (Substack) to capture emails
- Defer auth until we have user demand
- Focus on core value first

To harvest user emails:
- Use newsletter signup (Substack)
- Add something like posthog to track more fine-grained events related to users
- **Idea**: Provide a simple, valuable service like personalized, automated email-based daily newsletter based on the user's watchlist, using Google RSS feeds and a lightweight model (Haiku or 4o mini) to summarize the news

### 3. How do I manage real-time updates?
Simple 60-second polling because:
- Meets "1 min delay acceptable" requirement
- Much simpler than WebSockets
- Easy to implement
- Low server load
- Good enough for v1

Can add simple rate-limiting middleware to this, via Upstash Redis, or manually implement it for in-session requests and Yahoo Finance API, honestly.

### 4. What does the backend API looks like?
3 clean endpoints:
```typescript
// Search stocks
GET /api/search?q=<query>
=> [{symbol, name, exchange}]

// Get current prices
GET /api/stocks?symbols=AAPL,MSFT
=> [{symbol, price, change, changePercent}]

// Get chart data
GET /api/stocks/history?symbol=AAPL&range=1d
=> [{time, price}]
```
If we add auth, we would add OAUTH 2.0 via Google using a provider-agnostic library like Clerk or Supabase Auth so we can add more providers later.

### 5. What tech stack would work best?
For fastest v1:
- **Next.js**
- **React** 
- **Tailwind/shadcn** 
- **Yahoo Finance API** 
- **TypeScript** 
