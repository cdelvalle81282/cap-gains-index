# Cap Gains Index Dashboard - Design Document

**Date:** March 17, 2026
**Status:** Approved

## Overview

An investment dashboard that tracks custom sector indices built from a curated stock watchlist. Users can view sector-level performance, drill into individual stocks, see buy/hold/sell/short ratings, and read relevant news. An admin backend provides signal configuration, backtesting, and rating management.

## Architecture

**Monolithic Next.js** - Single codebase handling frontend, API routes, and server-side data fetching.

| Component | Choice |
|-----------|--------|
| Framework | Next.js 14+ (App Router) |
| UI | React + Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Database | Turso (serverless SQLite) + Prisma ORM |
| Stock Data | Yahoo Finance (yfinance via API route) |
| News | Google News RSS (filtered by company/sector) |
| Auth | Simple password gate (env var) |
| Hosting | Vercel (free tier) |
| Theme | Dark + light toggle |

## Scalability (500+ concurrent users)

- **ISR (Incremental Static Regeneration)**: Stock data refreshes every 5 minutes server-side. All users served from Vercel edge cache.
- **News caching**: RSS results cached for 30 minutes.
- **Turso**: Serverless SQLite handles concurrent reads across Vercel functions.
- **Edge CDN**: Vercel serves static assets and cached pages from global edge network.

## Index Calculation

**Market-cap weighted index**:
- Weight per stock = stock market cap / total sector market cap
- Index value = weighted sum of each stock's % change from a configurable baseline date (default: Jan 1 of current year)
- Historical index: replay daily closes with daily market caps
- 2 years of daily data maintained

## Sectors & Stocks (105 total)

### Defense, Drones & Defense AI (21 stocks)
AISP, RCAT, RTX, RFL, AVAV, KTOS, LHX, BAE, ITA, POWW, CMTL, BBAI, KAMN, VVX, MRCY, ESLT, NOC, TDY, UMAC, KBR, GEO

### Energy (40 stocks)
NXE, NNE, LEU, EE, NFE, BWXT, CEG, EXC, SMR, XOM, SHEL, APA, GLNG, YPF, EQT, SWN, BTU, ARCH, ARLP, AEP, CEIX, FRO, GNRC, EQNR, BEP, ENPH, FSLR, SEDG, AMRC, TAN, NOG, FLR, CCJ, TXNM, CVE, UUUU, HAL, BP, BE, NXT

### Commodities (17 stocks)
RIO, ALB, MP, LYSCF, NEM, LAC, ALTM, PLL, GLD, USAR, AREC, THM, SA, PPTA, FCX, VALE, CAT

### Crypto & Finance (8 stocks)
MSTR, HOOD, XYZ, BAC, BITO, GBTC, SOFI, CB

### AI Tech / Networking / Semis (18 stocks)
TXN, TSM, AMD, ADI, AVGO, MCHP, NVDA, SMH, UBER, LYFT, CSCO, ANET, IBM, PLTR, TSLA, FTNT, ASML, QS

### Broad Market ETFs (3)
MAGA, YALL, DEMZ

## Pages & Navigation

### Public Pages (no auth)

**1. Home / Overview** (`/`)
- Layout: Command Center (3x2 grid)
- Header: "CAP GAINS INDEX" branding, portfolio % change badge, date, theme toggle, admin link
- 6 sector cards: sector name, stock count, daily % change (green/red), 6-month sparkline chart, rating pill counts (BUY/HOLD/SELL/SHORT)
- Click card to drill into sector
- News feed below cards: headline, sector tag, timestamp, colored dot

**2. Sector Drill-Down** (`/sector/[slug]`)
- Full-width interactive line chart: 1M/3M/6M (default)/1Y/2Y time range buttons, daily granularity
- Stock table (sortable): Ticker, Name, Price, Daily Change %, Market Cap, Weight in Index, Manual Rating (color badge), Algo Signal (dot)
- Click row to view stock detail
- Sector news feed below table

**3. Stock Detail** (`/stock/[ticker]`)
- Price chart with 1M/3M/6M/1Y/2Y selector
- Key stats: Market Cap, P/E, 52-week High/Low, Volume, Dividend Yield
- Rating badge + analyst notes/thesis
- Signal breakdown: individual indicator scores + composite result
- Company news articles

### Admin Pages (password-gated)

**4. Admin Login** (`/admin`)
- Single password field, stored as ADMIN_PASSWORD env var
- Session cookie after login

**5. Rating Manager** (`/admin/ratings`)
- Bulk table: all stocks with dropdown rating selector (Buy/Hold/Sell/Short)
- Notes text field per stock
- Last reviewed timestamp

**6. Signal Configuration** (`/admin/signals`)
- Parameter controls (sliders/dropdowns):
  - RSI: period, oversold threshold, overbought threshold
  - Moving Averages: fast period, slow period
  - MACD: signal line parameters
  - Price vs 200-day MA toggle
  - Volume spike detection toggle
- Signal weight sliders
- Backtest runner: 1Y/2Y/3Y/5Y periods
- Results: accuracy %, return vs buy-and-hold, win/loss ratio
- Visual chart overlay: signal markers on historical price

**7. Stock Manager** (`/admin/stocks`)
- Add/remove stocks from sectors
- Reassign sectors

## Data Model (Prisma/Turso)

```
sectors: id, name, slug, description, color
stocks: id, ticker, name, sectorId, manualRating, notes, lastReviewedAt
signal_configs: id, name, parameters (JSON), isActive, createdAt
backtest_results: id, configId, period, accuracy, returnVsBuyHold, details (JSON), createdAt
price_cache: id, ticker, date, open, high, low, close, volume, marketCap
```

## Algorithmic Signals

**Indicators** (all configurable):
- RSI (period, oversold/overbought thresholds)
- Moving Average Crossover (fast/slow MA periods; golden cross = buy, death cross = sell)
- MACD signal line crossover
- Price vs 200-day MA (above = bullish, below = bearish)
- Volume spike detection (unusual volume as confirmation)

**Composite Signal**: Each indicator produces a score (-1 to +1). Weighted average of active indicators produces: Strong Buy, Buy, Hold, Sell, Strong Sell, Short.

**Backtesting**: Replays signals against historical data. Shows accuracy, return comparison, and visual overlays on price charts. Admin-only feature.

## Design System

### Dark Theme (default)
- Background: #0a0b0f (primary), #12131a (secondary), #161822 (cards)
- Borders: #1e2035
- Text: #e8e9f0 (primary), #8b8da3 (secondary), #5a5c72 (muted)
- Green (gains): #00d4aa
- Red (losses): #ff4d6a
- Blue (defense): #4d7cff
- Purple (crypto): #a855f7
- Amber (energy): #f59e0b
- Cyan (AI/tech): #06b6d4

### Light Theme
- Inverted color scheme with white backgrounds, dark text
- Same accent colors adjusted for light backgrounds

### Typography
- Primary: Inter (400/500/600/700/800)
- Mono: JetBrains Mono (prices, percentages, timestamps)

### Component Library
- shadcn/ui for dropdowns, buttons, inputs, tables, tooltips
- Custom sector cards with sparkline SVGs
- Color-coded rating pills (green=buy, amber=hold, red=sell, purple=short)

## User Flow

```
Home (6 sector cards + news)
  |
  +-> Click sector card -> Sector Drill-Down
  |     |
  |     +-> Click stock row -> Stock Detail
  |           |
  |           +-> View chart, stats, rating, signals, news
  |
  +-> Admin login -> Admin Dashboard
        |
        +-> Ratings manager (bulk edit ratings/notes)
        +-> Signal config (parameters, backtesting)
        +-> Stock manager (add/remove/reassign)
```

## Excluded Stocks (bearish/hedge/abandoned)
VIX, IBIT, JPM, HUN, BA, GOOGL, AAL, XBI, NVO, TLT
