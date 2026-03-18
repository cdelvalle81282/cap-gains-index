# Cap Gains Index Dashboard - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an investment dashboard tracking 6 custom sector indices (107 stocks) with market-cap weighted performance charts, buy/hold/sell/short ratings, algorithmic signals with backtesting, and sector news.

**Architecture:** Monolithic Next.js 14 App Router. API routes fetch Yahoo Finance data and Google News RSS, cached via ISR (5-min stocks, 30-min news). Turso serverless SQLite stores ratings, signal configs, and price cache. Public pages are read-only; admin pages behind a simple password gate.

**Tech Stack:** Next.js 14, React, Tailwind CSS, shadcn/ui, Recharts, Prisma + Turso, Vitest + React Testing Library, Vercel deployment.

**Design Doc:** `docs/plans/2026-03-17-cap-gains-index-design.md`

---

## Phase 1: Project Foundation

### Task 1: Scaffold Next.js Project

**Files:**
- Create: project root via `create-next-app`
- Modify: `package.json`, `tailwind.config.ts`, `tsconfig.json`

**Step 1: Create Next.js project**

```bash
cd "C:/Users/charl/Documents/Cap Gains Index"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the App Router structure with Tailwind.

**Step 2: Install core dependencies**

```bash
npm install recharts next-themes @prisma/client rss-parser technicalindicators
npm install -D prisma vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables: yes.

```bash
npx shadcn@latest add button card table dropdown-menu input label badge tooltip tabs slider switch separator
```

**Step 4: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 5: Add Google Fonts (Inter + JetBrains Mono)**

Modify `src/app/layout.tsx` to import Inter and JetBrains Mono from `next/font/google`.

**Step 6: Verify setup**

```bash
npm run dev
npm run test:run
```

**Step 7: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, Vitest"
```

---

### Task 2: Database Schema + Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`

**Step 1: Initialize Prisma with Turso**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 2: Write Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Sector {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  description String?
  color       String
  stocks      Stock[]
}

model Stock {
  id             String   @id @default(cuid())
  ticker         String   @unique
  name           String
  sectorId       String
  sector         Sector   @relation(fields: [sectorId], references: [id])
  manualRating   String   @default("hold")
  notes          String?
  lastReviewedAt DateTime?
}

model SignalConfig {
  id         String   @id @default(cuid())
  name       String
  parameters String
  isActive   Boolean  @default(false)
  createdAt  DateTime @default(now())
  backtests  BacktestResult[]
}

model BacktestResult {
  id              String       @id @default(cuid())
  configId        String
  config          SignalConfig @relation(fields: [configId], references: [id])
  period          String
  accuracy        Float
  returnVsBuyHold Float
  details         String
  createdAt       DateTime     @default(now())
}

model PriceCache {
  id        String   @id @default(cuid())
  ticker    String
  date      DateTime
  open      Float
  high      Float
  low       Float
  close     Float
  volume    Float
  marketCap Float?

  @@unique([ticker, date])
  @@index([ticker])
}
```

**Step 3: Set up local SQLite for development**

Add to `.env`:

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="changeme"
```

Add `.env` to `.gitignore`. Create `.env.example` with placeholder values.

**Step 4: Generate Prisma client + push schema**

```bash
npx prisma db push
npx prisma generate
```

**Step 5: Create database client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 6: Write seed script**

Create `prisma/seed.ts` with all 6 sectors and 107 stocks. Each sector gets: name, slug, description, color. Each stock gets: ticker, name, sectorId reference. Use the full stock list from the design doc.

Reference the design doc for exact tickers per sector. Stock names can be looked up or abbreviated.

Add to `package.json`:

```json
"prisma": { "seed": "npx tsx prisma/seed.ts" }
```

**Step 7: Run seed**

```bash
npx prisma db seed
```

**Step 8: Verify with Prisma Studio**

```bash
npx prisma studio
```

Confirm 6 sectors and 107 stocks visible.

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: add Prisma schema with sectors, stocks, signals, price cache + seed data"
```

---

### Task 3: Design System + Theme Toggle

**Files:**
- Create: `src/lib/theme-config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/theme-toggle.tsx`

**Step 1: Configure CSS custom properties**

Update `src/app/globals.css` with the dark/light theme variables from the design doc. Dark theme as default (`:root`), light theme under `.light` class. Include all colors: bg-primary, bg-secondary, bg-card, border, text-primary, text-secondary, text-muted, green, red, blue, purple, amber, cyan.

**Step 2: Set up next-themes provider**

Wrap app layout in `ThemeProvider` from `next-themes` in `src/app/layout.tsx`. Set `attribute="class"`, `defaultTheme="dark"`.

**Step 3: Create theme toggle component**

Create `src/components/theme-toggle.tsx` using shadcn Button. Toggle between dark/light using `useTheme()` from `next-themes`.

**Step 4: Create theme config**

Create `src/lib/theme-config.ts` exporting sector colors:

```typescript
export const SECTOR_COLORS: Record<string, string> = {
  defense: '#4d7cff',
  energy: '#f59e0b',
  commodities: '#00d4aa',
  'crypto-finance': '#a855f7',
  'ai-tech-semis': '#06b6d4',
  'broad-etfs': '#8b8da3',
}
```

**Step 5: Test theme toggle works**

```bash
npm run dev
```

Toggle should switch between dark and light themes.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add dark/light theme system with CSS variables and toggle"
```

---

## Phase 2: Data Layer

### Task 4: Yahoo Finance Data Fetching

**Files:**
- Create: `src/lib/yahoo-finance.ts`
- Create: `src/lib/yahoo-finance.test.ts`
- Create: `src/app/api/stocks/quote/route.ts`
- Create: `src/app/api/stocks/history/route.ts`

**Step 1: Write tests for Yahoo Finance module**

Create `src/lib/yahoo-finance.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { fetchQuote, fetchHistoricalData, type StockQuote } from './yahoo-finance'

describe('yahoo-finance', () => {
  it('fetchQuote returns structured quote data', async () => {
    const quote = await fetchQuote('AAPL')
    expect(quote).toHaveProperty('ticker')
    expect(quote).toHaveProperty('price')
    expect(quote).toHaveProperty('change')
    expect(quote).toHaveProperty('changePercent')
    expect(quote).toHaveProperty('marketCap')
  })

  it('fetchHistoricalData returns array of daily candles', async () => {
    const data = await fetchHistoricalData('AAPL', '6mo')
    expect(Array.isArray(data)).toBe(true)
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('date')
      expect(data[0]).toHaveProperty('close')
    }
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/yahoo-finance.test.ts
```

Expected: FAIL

**Step 3: Implement Yahoo Finance module**

Create `src/lib/yahoo-finance.ts`. Use the Yahoo Finance v8 API (public, no key needed):
- `fetchQuote(ticker)` - GET `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d` - parse response for price, change, marketCap
- `fetchHistoricalData(ticker, range)` - GET same endpoint with `range=2y&interval=1d` - parse into array of `{date, open, high, low, close, volume}`
- `fetchBulkQuotes(tickers[])` - batch fetch with `Promise.allSettled`, 100ms delay between calls to respect rate limits

Include TypeScript types: `StockQuote`, `HistoricalDataPoint`.

**Step 4: Run tests**

```bash
npm run test:run -- src/lib/yahoo-finance.test.ts
```

Expected: PASS (these are integration tests hitting real API)

**Step 5: Create API routes**

Create `src/app/api/stocks/quote/route.ts`:
- GET handler accepting `?tickers=NVDA,AMD,TSM`
- Returns JSON array of quotes
- Caches response with `revalidate: 300` (5 min ISR)

Create `src/app/api/stocks/history/route.ts`:
- GET handler accepting `?ticker=NVDA&range=6mo`
- Returns historical data array
- Caches with `revalidate: 3600` (1 hour)

**Step 6: Test API routes manually**

```bash
npm run dev
# Visit http://localhost:3000/api/stocks/quote?tickers=NVDA
# Visit http://localhost:3000/api/stocks/history?ticker=NVDA&range=6mo
```

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Yahoo Finance data fetching with API routes and ISR caching"
```

---

### Task 5: Index Calculation Engine

**Files:**
- Create: `src/lib/index-calculator.ts`
- Create: `src/lib/index-calculator.test.ts`

**Step 1: Write tests**

Create `src/lib/index-calculator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateMarketCapWeights, calculateIndexValue, calculateHistoricalIndex } from './index-calculator'

describe('calculateMarketCapWeights', () => {
  it('returns weights summing to 1', () => {
    const stocks = [
      { ticker: 'A', marketCap: 100 },
      { ticker: 'B', marketCap: 200 },
      { ticker: 'C', marketCap: 300 },
    ]
    const weights = calculateMarketCapWeights(stocks)
    const sum = Object.values(weights).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1.0)
    expect(weights['C']).toBeCloseTo(0.5)
    expect(weights['A']).toBeCloseTo(1 / 6)
  })

  it('handles single stock', () => {
    const weights = calculateMarketCapWeights([{ ticker: 'A', marketCap: 500 }])
    expect(weights['A']).toBe(1.0)
  })

  it('handles zero market cap gracefully', () => {
    const stocks = [
      { ticker: 'A', marketCap: 0 },
      { ticker: 'B', marketCap: 100 },
    ]
    const weights = calculateMarketCapWeights(stocks)
    expect(weights['A']).toBe(0)
    expect(weights['B']).toBe(1.0)
  })
})

describe('calculateIndexValue', () => {
  it('computes weighted daily change', () => {
    const weights = { 'A': 0.5, 'B': 0.5 }
    const changes = { 'A': 2.0, 'B': -1.0 }
    const result = calculateIndexValue(weights, changes)
    expect(result).toBeCloseTo(0.5)
  })
})

describe('calculateHistoricalIndex', () => {
  it('returns array of dated index values', () => {
    const historicalData = {
      'A': [
        { date: '2025-01-02', close: 100, marketCap: 1000 },
        { date: '2025-01-03', close: 105, marketCap: 1050 },
      ],
      'B': [
        { date: '2025-01-02', close: 50, marketCap: 500 },
        { date: '2025-01-03', close: 48, marketCap: 480 },
      ],
    }
    const result = calculateHistoricalIndex(historicalData, '2025-01-02')
    expect(result).toHaveLength(2)
    expect(result[0].value).toBe(100) // baseline = 100
    expect(result[1].value).toBeDefined()
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/index-calculator.test.ts
```

**Step 3: Implement index calculator**

Create `src/lib/index-calculator.ts`:

```typescript
export interface WeightedStock {
  ticker: string
  marketCap: number
}

export interface HistoricalPoint {
  date: string
  close: number
  marketCap: number
}

export function calculateMarketCapWeights(stocks: WeightedStock[]): Record<string, number> {
  const totalCap = stocks.reduce((sum, s) => sum + s.marketCap, 0)
  if (totalCap === 0) return Object.fromEntries(stocks.map(s => [s.ticker, 0]))
  return Object.fromEntries(stocks.map(s => [s.ticker, s.marketCap / totalCap]))
}

export function calculateIndexValue(weights: Record<string, number>, changes: Record<string, number>): number {
  return Object.entries(weights).reduce((sum, [ticker, weight]) => {
    return sum + weight * (changes[ticker] ?? 0)
  }, 0)
}

export function calculateHistoricalIndex(
  historicalData: Record<string, HistoricalPoint[]>,
  baselineDate: string,
  baseValue: number = 100
): { date: string; value: number }[] {
  const tickers = Object.keys(historicalData)
  if (tickers.length === 0) return []

  const dates = historicalData[tickers[0]].map(d => d.date)
  const baselineIdx = dates.indexOf(baselineDate)
  if (baselineIdx === -1) return []

  const result: { date: string; value: number }[] = []

  for (let i = baselineIdx; i < dates.length; i++) {
    const date = dates[i]
    const stocks: WeightedStock[] = tickers.map(t => ({
      ticker: t,
      marketCap: historicalData[t][i]?.marketCap ?? 0,
    }))
    const weights = calculateMarketCapWeights(stocks)
    const changes: Record<string, number> = {}
    for (const t of tickers) {
      const baseClose = historicalData[t][baselineIdx]?.close ?? 1
      const currentClose = historicalData[t][i]?.close ?? baseClose
      changes[t] = ((currentClose - baseClose) / baseClose) * 100
    }
    const indexChange = calculateIndexValue(weights, changes)
    result.push({ date, value: baseValue + indexChange })
  }

  return result
}
```

**Step 4: Run tests**

```bash
npm run test:run -- src/lib/index-calculator.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add market-cap weighted index calculation engine with tests"
```

---

### Task 6: News Fetching

**Files:**
- Create: `src/lib/news.ts`
- Create: `src/app/api/news/route.ts`

**Step 1: Implement news fetcher**

Create `src/lib/news.ts`:

```typescript
import Parser from 'rss-parser'

export interface NewsArticle {
  title: string
  link: string
  pubDate: string
  source: string
  snippet: string
}

const parser = new Parser()

export async function fetchNewsForQuery(query: string, limit = 5): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  const feed = await parser.parseURL(url)
  return feed.items.slice(0, limit).map(item => ({
    title: item.title ?? '',
    link: item.link ?? '',
    pubDate: item.pubDate ?? '',
    source: item.creator ?? extractSource(item.title ?? ''),
    snippet: item.contentSnippet ?? '',
  }))
}

function extractSource(title: string): string {
  const match = title.match(/ - ([^-]+)$/)
  return match ? match[1].trim() : 'Unknown'
}

export async function fetchSectorNews(sectorName: string, tickers: string[]): Promise<NewsArticle[]> {
  const query = `${sectorName} stocks ${tickers.slice(0, 5).join(' OR ')}`
  return fetchNewsForQuery(query, 8)
}

export async function fetchStockNews(ticker: string, companyName: string): Promise<NewsArticle[]> {
  return fetchNewsForQuery(`${companyName} ${ticker} stock`, 5)
}
```

**Step 2: Create news API route**

Create `src/app/api/news/route.ts`:
- GET handler accepting `?sector=defense` or `?ticker=NVDA&name=Nvidia`
- Returns JSON array of NewsArticle
- Caches with `revalidate: 1800` (30 min)

**Step 3: Test manually**

```bash
npm run dev
# Visit http://localhost:3000/api/news?sector=defense
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Google News RSS fetching with sector and stock-level queries"
```

---

## Phase 3: Public Pages

### Task 7: App Layout + Header

**Files:**
- Create: `src/components/header.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Build the header component**

Create `src/components/header.tsx` matching the Command Center mockup:
- Logo "CAP GAINS INDEX" with gradient text
- Portfolio daily change badge (green/red pill)
- Date display (JetBrains Mono)
- Theme toggle button
- Admin link button

**Step 2: Update root layout**

Modify `src/app/layout.tsx`:
- Import Inter + JetBrains Mono from `next/font/google`
- ThemeProvider wrapper
- Header component
- Main content area with consistent padding

**Step 3: Verify in browser**

```bash
npm run dev
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add app layout with header, branding, theme toggle"
```

---

### Task 8: Home Page - Sector Cards

**Files:**
- Create: `src/components/sector-card.tsx`
- Create: `src/components/sparkline.tsx`
- Create: `src/components/rating-pills.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Build Sparkline component**

Create `src/components/sparkline.tsx`:
- Accepts `data: number[]` and `color: string`
- Renders an SVG polyline with gradient fill
- Responsive, fills container

**Step 2: Build RatingPills component**

Create `src/components/rating-pills.tsx`:
- Accepts rating counts: `{buy: number, hold: number, sell: number, short: number}`
- Renders colored badge pills matching the design

**Step 3: Build SectorCard component**

Create `src/components/sector-card.tsx`:
- Accepts: sector name, stock count, daily change %, sparkline data, rating counts, color, slug
- Renders the Command Center card with top color accent bar, change percentage, sparkline, rating pills
- Wrapped in Next.js `Link` to `/sector/[slug]`

**Step 4: Build Home page**

Modify `src/app/page.tsx`:
- Server component that fetches all sectors + their stocks from DB
- Fetches bulk quotes for all tickers via API route
- Calculates daily index change per sector using `calculateMarketCapWeights` and `calculateIndexValue`
- Renders 3x2 grid of SectorCards
- ISR revalidation: 300 seconds

**Step 5: Verify in browser**

```bash
npm run dev
```

Should see 6 sector cards with live data.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add home page with 6 sector cards, sparklines, rating pills"
```

---

### Task 9: Home Page - News Feed

**Files:**
- Create: `src/components/news-feed.tsx`
- Create: `src/components/news-item.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Build NewsItem component**

Create `src/components/news-item.tsx`:
- Colored dot (matches sector), headline, sector tag badge, timestamp
- Clickable row linking to article URL (opens in new tab)

**Step 2: Build NewsFeed component**

Create `src/components/news-feed.tsx`:
- Section label "LATEST NEWS"
- Renders list of NewsItem components
- Rounded container with divider lines between items

**Step 3: Integrate into Home page**

Modify `src/app/page.tsx`:
- Fetch aggregated news across all sectors
- Render NewsFeed below the sector grid

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add news feed to home page with sector-tagged articles"
```

---

### Task 10: Sector Drill-Down Page

**Files:**
- Create: `src/app/sector/[slug]/page.tsx`
- Create: `src/components/index-chart.tsx`
- Create: `src/components/stock-table.tsx`
- Create: `src/components/time-range-selector.tsx`

**Step 1: Build TimeRangeSelector component**

Create `src/components/time-range-selector.tsx`:
- Button group: 1M, 3M, 6M (default active), 1Y, 2Y
- Emits selected range via callback
- Active button styled with blue background

**Step 2: Build IndexChart component**

Create `src/components/index-chart.tsx`:
- Uses Recharts `LineChart` with `ResponsiveContainer`
- Accepts historical index data `{date, value}[]` and sector color
- Hover tooltip: date, index value, daily % change
- Area fill with gradient matching sector color
- TimeRangeSelector integrated above chart

**Step 3: Build StockTable component**

Create `src/components/stock-table.tsx`:
- Uses shadcn Table
- Columns: Ticker, Name, Price, Daily Change %, Market Cap, Weight, Rating (badge), Signal (dot)
- Sortable column headers (click to sort)
- Each row links to `/stock/[ticker]`
- Color-coded: green for positive change, red for negative

**Step 4: Build Sector page**

Create `src/app/sector/[slug]/page.tsx`:
- Server component with dynamic params
- Fetch sector from DB by slug, get all stocks
- Fetch historical data for all stocks in sector (2 years)
- Calculate historical index using `calculateHistoricalIndex`
- Fetch current quotes for all stocks
- Calculate weights
- Render: back link, sector title, IndexChart, StockTable, sector news feed
- ISR revalidation: 300 seconds

**Step 5: Verify drilling from home to sector**

```bash
npm run dev
```

Click a sector card on home page, verify chart and table render.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add sector drill-down page with index chart, stock table, time range selector"
```

---

### Task 11: Stock Detail Page

**Files:**
- Create: `src/app/stock/[ticker]/page.tsx`
- Create: `src/components/stock-stats.tsx`
- Create: `src/components/rating-display.tsx`
- Create: `src/components/signal-breakdown.tsx`

**Step 1: Build StockStats component**

Create `src/components/stock-stats.tsx`:
- Grid of key stats: Market Cap, P/E, 52-week High, 52-week Low, Volume, Dividend Yield
- Uses JetBrains Mono for values
- Clean card layout

**Step 2: Build RatingDisplay component**

Create `src/components/rating-display.tsx`:
- Shows current rating as large color-coded badge
- Shows analyst notes/thesis text below
- Shows "Last reviewed: [date]"
- Read-only on public page

**Step 3: Build SignalBreakdown component**

Create `src/components/signal-breakdown.tsx`:
- For each active indicator: name, current value, bullish/bearish dot
- Composite score gauge/bar
- Uses the signal calculation from Task 13 (can stub initially, show "Signals coming soon" placeholder)

**Step 4: Build Stock Detail page**

Create `src/app/stock/[ticker]/page.tsx`:
- Fetch stock from DB by ticker (with sector)
- Fetch quote and historical data from Yahoo Finance
- Fetch company news
- Render: back link to sector, stock name + ticker, IndexChart (reuse for single stock), StockStats, RatingDisplay, SignalBreakdown (stub), news feed

**Step 5: Verify full drill-down flow**

Home -> Sector -> Stock. All three pages should work.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add stock detail page with chart, stats, rating, news"
```

---

## Phase 4: Admin Backend

### Task 12: Admin Authentication

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`

**Step 1: Implement auth helpers**

Create `src/lib/auth.ts`:
- `createSession()` - generates a session token, stores in cookie
- `validateSession(request)` - checks cookie against stored session
- Uses `cookies()` from `next/headers`

**Step 2: Create login API route**

Create `src/app/api/admin/login/route.ts`:
- POST handler accepting `{ password: string }`
- Compares against `process.env.ADMIN_PASSWORD`
- On success: sets session cookie, returns 200
- On failure: returns 401

**Step 3: Create login page**

Create `src/app/admin/page.tsx`:
- Password input field + submit button
- Client component with form submission
- On success, redirect to `/admin/ratings`
- Error message on wrong password

**Step 4: Create admin layout with middleware protection**

Create `src/middleware.ts`:
- Protects `/admin/ratings`, `/admin/signals`, `/admin/stocks` routes
- Checks session cookie
- Redirects to `/admin` (login) if not authenticated

Create `src/app/admin/layout.tsx`:
- Admin sidebar/nav: Ratings, Signals, Stocks links
- Logout button

**Step 5: Test login flow**

```bash
npm run dev
```

Visit `/admin`, enter password, verify access to admin pages.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add admin auth with password gate, session cookies, middleware protection"
```

---

### Task 13: Admin Rating Manager

**Files:**
- Create: `src/app/admin/ratings/page.tsx`
- Create: `src/app/api/admin/ratings/route.ts`
- Create: `src/components/admin/rating-editor.tsx`

**Step 1: Create ratings API route**

Create `src/app/api/admin/ratings/route.ts`:
- GET: returns all stocks with their ratings, grouped by sector
- PUT: accepts `{ ticker, rating, notes }`, updates stock in DB, sets `lastReviewedAt` to now

**Step 2: Build RatingEditor component**

Create `src/components/admin/rating-editor.tsx`:
- Table: Ticker, Name, Sector, Current Rating (dropdown: Buy/Hold/Sell/Short), Notes (text input), Last Reviewed
- Dropdown changes trigger PUT to API immediately (optimistic update)
- Notes field saves on blur

**Step 3: Build Ratings admin page**

Create `src/app/admin/ratings/page.tsx`:
- Fetches all stocks from API
- Renders RatingEditor
- Filter/search bar at top
- Group by sector with collapsible sections

**Step 4: Test rating updates**

Change a rating, refresh page, verify it persisted.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add admin rating manager with bulk editing and notes"
```

---

### Task 14: Signal Calculation Engine

**Files:**
- Create: `src/lib/signals.ts`
- Create: `src/lib/signals.test.ts`

**Step 1: Write signal tests**

Create `src/lib/signals.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateRSI, calculateMACD, calculateMovingAverage, calculateCompositeSignal } from './signals'

describe('calculateRSI', () => {
  it('returns RSI value between 0 and 100', () => {
    const closes = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28]
    const rsi = calculateRSI(closes, 14)
    expect(rsi).toBeGreaterThanOrEqual(0)
    expect(rsi).toBeLessThanOrEqual(100)
  })
})

describe('calculateCompositeSignal', () => {
  it('returns score between -1 and 1', () => {
    const indicators = [
      { name: 'RSI', score: 0.5, weight: 1 },
      { name: 'MACD', score: -0.3, weight: 1 },
    ]
    const result = calculateCompositeSignal(indicators)
    expect(result.score).toBeGreaterThanOrEqual(-1)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('maps score to correct label', () => {
    const bullish = [{ name: 'RSI', score: 0.8, weight: 1 }]
    expect(calculateCompositeSignal(bullish).label).toBe('Strong Buy')

    const bearish = [{ name: 'RSI', score: -0.8, weight: 1 }]
    expect(calculateCompositeSignal(bearish).label).toBe('Strong Sell')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/signals.test.ts
```

**Step 3: Implement signal calculations**

Create `src/lib/signals.ts` using `technicalindicators` library:
- `calculateRSI(closes, period)` - returns RSI value
- `calculateMACD(closes, fastPeriod, slowPeriod, signalPeriod)` - returns MACD histogram value
- `calculateMovingAverage(closes, period)` - returns MA value
- `isGoldenCross(closes, fastPeriod, slowPeriod)` - returns boolean
- `isDeathCross(closes, fastPeriod, slowPeriod)` - returns boolean
- `detectVolumeSpike(volumes, threshold)` - returns boolean
- `calculateCompositeSignal(indicators)` - returns `{ score, label, indicators }`

Signal labels: score > 0.6 = "Strong Buy", > 0.2 = "Buy", > -0.2 = "Hold", > -0.6 = "Sell", <= -0.6 = "Strong Sell"

**Step 4: Run tests**

```bash
npm run test:run -- src/lib/signals.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add algorithmic signal calculation engine (RSI, MACD, MA, volume) with tests"
```

---

### Task 15: Admin Signal Configuration + Backtesting

**Files:**
- Create: `src/app/admin/signals/page.tsx`
- Create: `src/components/admin/signal-config-panel.tsx`
- Create: `src/components/admin/backtest-runner.tsx`
- Create: `src/lib/backtest.ts`
- Create: `src/lib/backtest.test.ts`
- Create: `src/app/api/admin/signals/route.ts`
- Create: `src/app/api/admin/backtest/route.ts`

**Step 1: Write backtest tests**

Create `src/lib/backtest.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { runBacktest } from './backtest'

describe('runBacktest', () => {
  it('returns accuracy and return metrics', () => {
    const historicalData = generateMockHistoricalData(252) // 1 year
    const config = {
      rsi: { period: 14, oversold: 30, overbought: 70, weight: 1 },
      ma: { fast: 20, slow: 50, weight: 1 },
    }
    const result = runBacktest(historicalData, config)
    expect(result).toHaveProperty('accuracy')
    expect(result).toHaveProperty('returnPercent')
    expect(result).toHaveProperty('buyAndHoldReturn')
    expect(result).toHaveProperty('trades')
    expect(result.accuracy).toBeGreaterThanOrEqual(0)
    expect(result.accuracy).toBeLessThanOrEqual(100)
  })
})
```

**Step 2: Implement backtest engine**

Create `src/lib/backtest.ts`:
- `runBacktest(historicalData, signalConfig)` - simulates trading based on signals over historical period
- Tracks: entry/exit points, P&L per trade, accuracy (% of profitable trades), total return vs buy-and-hold
- Returns: `{ accuracy, returnPercent, buyAndHoldReturn, winLossRatio, trades: {date, action, price}[] }`

**Step 3: Create signal config API routes**

Create `src/app/api/admin/signals/route.ts`:
- GET: return active signal config
- PUT: save signal config parameters to DB

Create `src/app/api/admin/backtest/route.ts`:
- POST: accepts `{ ticker, config, period }`, runs backtest, returns results
- Saves results to BacktestResult table

**Step 4: Build Signal Config Panel**

Create `src/components/admin/signal-config-panel.tsx`:
- Sliders for: RSI period, oversold, overbought thresholds
- Sliders for: fast MA period, slow MA period
- MACD toggle + parameters
- Volume spike toggle + threshold
- Weight sliders for each indicator
- Save button

**Step 5: Build Backtest Runner**

Create `src/components/admin/backtest-runner.tsx`:
- Select stock ticker dropdown
- Period buttons: 1Y, 2Y, 3Y, 5Y
- Run button
- Results display: accuracy %, return vs B&H, win/loss ratio
- Recharts overlay: price chart with buy/sell markers

**Step 6: Build Signals admin page**

Create `src/app/admin/signals/page.tsx`:
- Two-column layout: config panel left, backtest runner right
- Loads saved config on mount

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add admin signal configuration UI with backtesting engine"
```

---

### Task 16: Wire Signals into Public Pages

**Files:**
- Modify: `src/components/signal-breakdown.tsx` (remove stub)
- Modify: `src/components/stock-table.tsx` (add signal dots)
- Modify: `src/app/stock/[ticker]/page.tsx`
- Create: `src/app/api/stocks/signals/route.ts`

**Step 1: Create signals API route**

Create `src/app/api/stocks/signals/route.ts`:
- GET `?ticker=NVDA` - fetches historical data, loads active signal config, runs signals, returns composite result + individual indicator scores

**Step 2: Update SignalBreakdown component**

Remove stub. Fetch signal data from API. Display each indicator with its score and bullish/bearish status. Show composite gauge.

**Step 3: Update StockTable**

Add signal dot column to the stock table on sector drill-down pages.

**Step 4: Verify full flow**

Home -> Sector -> Stock should show live signals everywhere.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: wire algorithmic signals into public stock detail and sector table"
```

---

### Task 17: Admin Stock Manager

**Files:**
- Create: `src/app/admin/stocks/page.tsx`
- Create: `src/components/admin/stock-manager.tsx`
- Create: `src/app/api/admin/stocks/route.ts`

**Step 1: Create stock management API**

Create `src/app/api/admin/stocks/route.ts`:
- GET: return all stocks grouped by sector
- POST: add new stock `{ ticker, name, sectorSlug }`
- PUT: move stock to different sector `{ ticker, newSectorSlug }`
- DELETE: remove stock `{ ticker }`

**Step 2: Build StockManager component**

Create `src/components/admin/stock-manager.tsx`:
- Grouped table by sector (collapsible sections)
- "Add Stock" form: ticker input, name input, sector dropdown
- Per-stock: sector reassignment dropdown, delete button (with confirm)
- Search/filter bar

**Step 3: Build Stocks admin page**

Create `src/app/admin/stocks/page.tsx`:
- Renders StockManager component

**Step 4: Test CRUD operations**

Add a stock, move it, delete it. Verify changes reflect on public pages.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add admin stock manager with add, remove, reassign sector"
```

---

## Phase 5: Polish + Deploy

### Task 18: Responsive Design + Mobile

**Files:**
- Modify: various component files

**Step 1: Make sector grid responsive**

- Desktop: 3x2 grid
- Tablet: 2x3 grid
- Mobile: 1x6 stack

**Step 2: Make stock table horizontally scrollable on mobile**

**Step 3: Make charts responsive**

Recharts `ResponsiveContainer` should handle this, verify.

**Step 4: Test on mobile viewport**

Use Chrome DevTools responsive mode.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add responsive design for mobile and tablet viewports"
```

---

### Task 19: Error Handling + Loading States

**Files:**
- Create: `src/components/loading-skeleton.tsx`
- Create: `src/app/error.tsx`
- Create: `src/app/sector/[slug]/loading.tsx`
- Create: `src/app/stock/[ticker]/loading.tsx`

**Step 1: Create loading skeletons**

Animated pulse skeletons matching the layout of sector cards, charts, tables.

**Step 2: Add Next.js loading.tsx files**

For sector and stock pages to show skeletons during data fetch.

**Step 3: Add error boundaries**

Create `error.tsx` files with user-friendly error messages and retry buttons.

**Step 4: Handle API failures gracefully**

If Yahoo Finance is down, show cached data with a "data may be delayed" notice.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add loading skeletons, error boundaries, graceful API failure handling"
```

---

### Task 20: Vercel Deployment

**Files:**
- Create: `vercel.json` (if needed)
- Modify: `.env.example`

**Step 1: Set up Turso for production**

```bash
npm install @libsql/client
turso db create cap-gains-index
turso db show cap-gains-index --url
turso db tokens create cap-gains-index
```

Update Prisma to use Turso adapter for production. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars.

**Step 2: Push to GitHub**

```bash
git remote add origin <github-repo-url>
git push -u origin main
```

**Step 3: Deploy to Vercel**

- Connect GitHub repo to Vercel
- Set environment variables: `DATABASE_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_PASSWORD`
- Deploy

**Step 4: Run Prisma migration on Turso**

```bash
npx prisma db push
npx prisma db seed
```

**Step 5: Verify production**

Visit the Vercel URL. Check all pages, admin login, data loading.

**Step 6: Commit any deployment config**

```bash
git add -A && git commit -m "chore: add Vercel deployment configuration"
```

---

## Task Dependency Graph

```
Task 1 (Scaffold)
  └── Task 2 (Database)
       └── Task 3 (Theme)
            ├── Task 4 (Yahoo Finance) ──┐
            ├── Task 5 (Index Calc) ─────┤
            └── Task 6 (News) ──────────┤
                                         ├── Task 7 (Layout)
                                         │    └── Task 8 (Sector Cards)
                                         │         └── Task 9 (News Feed)
                                         │              └── Task 10 (Sector Page)
                                         │                   └── Task 11 (Stock Detail)
                                         │
                                         ├── Task 12 (Admin Auth)
                                         │    └── Task 13 (Ratings)
                                         │    └── Task 17 (Stock Manager)
                                         │
                                         └── Task 14 (Signals Engine)
                                              └── Task 15 (Signal Config + Backtest)
                                                   └── Task 16 (Wire Signals to Public)

Task 18 (Responsive) ─── after Tasks 8-11
Task 19 (Error Handling) ─── after Tasks 8-11
Task 20 (Deploy) ─── after all tasks
```

**Parallelizable work:**
- Tasks 4, 5, 6 can run in parallel (data layer)
- Tasks 12-13, 14-15 can run in parallel with Tasks 7-11 (admin vs public)
- Tasks 18, 19 can run in parallel (polish)
