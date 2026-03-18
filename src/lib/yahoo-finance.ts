export interface StockQuote {
  ticker: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  previousClose: number
  volume: number
  name: string
}

export interface HistoricalDataPoint {
  date: string // ISO date string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string
        shortName?: string
        longName?: string
        regularMarketPrice: number
        previousClose: number
        marketCap?: number
        regularMarketVolume?: number
        chartPreviousClose?: number
      }
      timestamp?: number[]
      indicators: {
        quote: Array<{
          open: (number | null)[]
          high: (number | null)[]
          low: (number | null)[]
          close: (number | null)[]
          volume: (number | null)[]
        }>
      }
    }>
    error: null | { code: string; description: string }
  }
}

async function fetchYahooChart(
  ticker: string,
  range: string = '1d',
  interval: string = '1d'
): Promise<YahooChartResponse> {
  const url = `${YAHOO_BASE_URL}/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Yahoo Finance API error: ${response.status} ${response.statusText} for ticker ${ticker}`
    )
  }

  const data = (await response.json()) as YahooChartResponse

  if (data.chart.error) {
    throw new Error(
      `Yahoo Finance chart error: ${data.chart.error.description}`
    )
  }

  if (!data.chart.result || data.chart.result.length === 0) {
    throw new Error(`No data returned for ticker ${ticker}`)
  }

  return data
}

/**
 * Fetch a real-time quote for a single ticker.
 */
export async function fetchQuote(ticker: string): Promise<StockQuote> {
  const data = await fetchYahooChart(ticker, '1d', '1d')
  const result = data.chart.result[0]
  const meta = result.meta

  const price = meta.regularMarketPrice
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price
  const change = price - previousClose
  const changePercent =
    previousClose !== 0 ? (change / previousClose) * 100 : 0

  return {
    ticker: meta.symbol ?? ticker.toUpperCase(),
    price,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    marketCap: meta.marketCap ?? 0,
    previousClose,
    volume: meta.regularMarketVolume ?? 0,
    name: meta.shortName ?? meta.longName ?? ticker.toUpperCase(),
  }
}

/**
 * Fetch historical OHLCV data for a ticker over a given range.
 * Valid ranges: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
 */
export async function fetchHistoricalData(
  ticker: string,
  range: string = '6mo'
): Promise<HistoricalDataPoint[]> {
  const data = await fetchYahooChart(ticker, range, '1d')
  const result = data.chart.result[0]

  const timestamps = result.timestamp
  if (!timestamps || timestamps.length === 0) {
    return []
  }

  const quote = result.indicators.quote[0]
  const points: HistoricalDataPoint[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const close = quote.close[i]
    const open = quote.open[i]
    const high = quote.high[i]
    const low = quote.low[i]
    const volume = quote.volume[i]

    // Skip days where close is null (e.g., holidays with partial data)
    if (close === null || close === undefined) {
      continue
    }

    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0]

    points.push({
      date,
      open: open ?? close,
      high: high ?? close,
      low: low ?? close,
      close,
      volume: volume ?? 0,
    })
  }

  return points
}

/**
 * Fetch quotes for multiple tickers in batch.
 * Uses Promise.allSettled so one failure doesn't break the entire batch.
 * Adds a 50ms delay between calls to avoid rate limiting.
 */
export async function fetchBulkQuotes(
  tickers: string[]
): Promise<(StockQuote | null)[]> {
  const results: (StockQuote | null)[] = []

  for (let i = 0; i < tickers.length; i++) {
    if (i > 0) {
      await delay(50)
    }
    try {
      const quote = await fetchQuote(tickers[i])
      results.push(quote)
    } catch {
      console.error(`Failed to fetch quote for ${tickers[i]}`)
      results.push(null)
    }
  }

  return results
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
