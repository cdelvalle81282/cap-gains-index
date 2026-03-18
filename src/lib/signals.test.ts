import { describe, it, expect } from 'vitest'
import {
  calculateRSI,
  calculateMACD,
  calculateMovingAverage,
  calculateCompositeSignal,
} from './signals'

describe('calculateRSI', () => {
  it('returns RSI value between 0 and 100', () => {
    // Use at least 15 data points for RSI-14
    const closes = [
      44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08,
      45.89, 46.03, 45.61, 46.28, 46.28, 46.0, 46.03, 46.41, 46.22, 45.64,
    ]
    const rsi = calculateRSI(closes, 14)
    expect(rsi).toBeGreaterThanOrEqual(0)
    expect(rsi).toBeLessThanOrEqual(100)
  })

  it('returns high RSI for consistently rising prices', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i * 2)
    const rsi = calculateRSI(closes, 14)
    expect(rsi).toBeGreaterThan(70) // Should be overbought
  })

  it('returns low RSI for consistently falling prices', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 - i * 2)
    const rsi = calculateRSI(closes, 14)
    expect(rsi).toBeLessThan(30) // Should be oversold
  })
})

describe('calculateMovingAverage', () => {
  it('calculates correct simple moving average', () => {
    const closes = [1, 2, 3, 4, 5]
    const ma = calculateMovingAverage(closes, 3)
    expect(ma).toBe(4) // Average of last 3: (3+4+5)/3 = 4
  })

  it('returns NaN for insufficient data', () => {
    const closes = [1, 2]
    const ma = calculateMovingAverage(closes, 5)
    expect(ma).toBeNaN()
  })
})

describe('calculateMACD', () => {
  it('returns macd, signal, and histogram', () => {
    // Need at least 26 + 9 data points for default MACD
    const closes = Array.from(
      { length: 50 },
      (_, i) => 100 + Math.sin(i * 0.5) * 10
    )
    const result = calculateMACD(closes)
    expect(result).toHaveProperty('macd')
    expect(result).toHaveProperty('signal')
    expect(result).toHaveProperty('histogram')
    expect(typeof result.macd).toBe('number')
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
    const strongBuy = [{ name: 'RSI', score: 0.8, weight: 1 }]
    expect(calculateCompositeSignal(strongBuy).label).toBe('Strong Buy')

    const buy = [{ name: 'RSI', score: 0.4, weight: 1 }]
    expect(calculateCompositeSignal(buy).label).toBe('Buy')

    const hold = [{ name: 'RSI', score: 0.0, weight: 1 }]
    expect(calculateCompositeSignal(hold).label).toBe('Hold')

    const sell = [{ name: 'RSI', score: -0.4, weight: 1 }]
    expect(calculateCompositeSignal(sell).label).toBe('Sell')

    const strongSell = [{ name: 'RSI', score: -0.8, weight: 1 }]
    expect(calculateCompositeSignal(strongSell).label).toBe('Strong Sell')
  })

  it('correctly weights indicators', () => {
    const indicators = [
      { name: 'RSI', score: 1.0, weight: 3 },
      { name: 'MACD', score: -1.0, weight: 1 },
    ]
    const result = calculateCompositeSignal(indicators)
    // Weighted: (1*3 + -1*1) / (3+1) = 2/4 = 0.5
    expect(result.score).toBeCloseTo(0.5)
  })
})
