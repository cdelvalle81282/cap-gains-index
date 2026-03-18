import { NextRequest, NextResponse } from 'next/server'
import { runBacktest, DEFAULT_BACKTEST_CONFIG } from '@/lib/backtest'
import type { BacktestConfig, HistoricalBar } from '@/lib/backtest'

// POST: Run backtest with given config
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { ticker, config, period } = body as {
    ticker: string
    config?: BacktestConfig
    period?: string
  }

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 })
  }

  const backtestConfig = config || DEFAULT_BACKTEST_CONFIG

  // Generate mock historical data for backtesting
  // In production, this would fetch from Yahoo Finance or price cache
  const bars = generateMockBacktestData(ticker, period || '1Y')

  const result = runBacktest(bars, backtestConfig)

  return NextResponse.json({
    ticker,
    period: period || '1Y',
    ...result,
  })
}

function generateMockBacktestData(ticker: string, period: string): HistoricalBar[] {
  // Seeded random for deterministic results per ticker
  let hash = 0
  for (let i = 0; i < ticker.length; i++) {
    hash = ((hash << 5) - hash) + ticker.charCodeAt(i)
    hash = hash & hash
  }
  let state = hash

  function rng() {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }

  const periodDays: Record<string, number> = { '1Y': 252, '2Y': 504, '3Y': 756, '5Y': 1260 }
  const days = periodDays[period] || 252

  const bars: HistoricalBar[] = []
  let price = 50 + rng() * 200
  const trend = (rng() - 0.45) * 0.15

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    price += trend + (rng() - 0.5) * 3 + Math.sin(i * 0.05) * 1.5
    price = Math.max(10, price)

    bars.push({
      date: date.toISOString().split('T')[0],
      close: Math.round(price * 100) / 100,
      volume: Math.floor(500000 + rng() * 2000000),
    })
  }

  return bars
}
