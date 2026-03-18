import { describe, it, expect } from 'vitest'
import { runBacktest, DEFAULT_BACKTEST_CONFIG } from './backtest'
import type { HistoricalBar } from './backtest'

function generateMockBars(count: number): HistoricalBar[] {
  const bars: HistoricalBar[] = []
  let price = 100
  for (let i = 0; i < count; i++) {
    const date = new Date(2024, 0, 1)
    date.setDate(date.getDate() + i)
    price += (Math.sin(i * 0.1) * 2) + (Math.random() - 0.5)
    price = Math.max(10, price)
    bars.push({
      date: date.toISOString().split('T')[0],
      close: Math.round(price * 100) / 100,
      volume: 1000000 + Math.floor(Math.random() * 500000),
    })
  }
  return bars
}

describe('runBacktest', () => {
  it('returns metrics with sufficient data', () => {
    const bars = generateMockBars(252)
    const result = runBacktest(bars, DEFAULT_BACKTEST_CONFIG)
    expect(result).toHaveProperty('accuracy')
    expect(result).toHaveProperty('returnPercent')
    expect(result).toHaveProperty('buyAndHoldReturn')
    expect(result).toHaveProperty('winLossRatio')
    expect(result).toHaveProperty('totalTrades')
    expect(result).toHaveProperty('trades')
    expect(result.accuracy).toBeGreaterThanOrEqual(0)
    expect(result.accuracy).toBeLessThanOrEqual(100)
  })

  it('returns empty results with insufficient data', () => {
    const bars = generateMockBars(30)
    const result = runBacktest(bars, DEFAULT_BACKTEST_CONFIG)
    expect(result.totalTrades).toBe(0)
    expect(result.trades).toHaveLength(0)
  })

  it('handles all indicators disabled', () => {
    const bars = generateMockBars(252)
    const config = {
      rsi: { ...DEFAULT_BACKTEST_CONFIG.rsi, enabled: false },
      ma: { ...DEFAULT_BACKTEST_CONFIG.ma, enabled: false },
      macd: { ...DEFAULT_BACKTEST_CONFIG.macd, enabled: false },
      volumeSpike: { ...DEFAULT_BACKTEST_CONFIG.volumeSpike, enabled: false },
    }
    const result = runBacktest(bars, config)
    expect(result.totalTrades).toBe(0)
  })
})
