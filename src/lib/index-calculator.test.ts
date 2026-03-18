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

  it('handles empty array', () => {
    const weights = calculateMarketCapWeights([])
    expect(Object.keys(weights)).toHaveLength(0)
  })

  it('handles all zero market caps', () => {
    const stocks = [
      { ticker: 'A', marketCap: 0 },
      { ticker: 'B', marketCap: 0 },
    ]
    const weights = calculateMarketCapWeights(stocks)
    expect(weights['A']).toBe(0)
    expect(weights['B']).toBe(0)
  })
})

describe('calculateIndexValue', () => {
  it('computes weighted daily change', () => {
    const weights = { 'A': 0.5, 'B': 0.5 }
    const changes = { 'A': 2.0, 'B': -1.0 }
    const result = calculateIndexValue(weights, changes)
    expect(result).toBeCloseTo(0.5)
  })

  it('handles missing ticker in changes', () => {
    const weights = { 'A': 0.5, 'B': 0.5 }
    const changes = { 'A': 2.0 } // B missing
    const result = calculateIndexValue(weights, changes)
    expect(result).toBeCloseTo(1.0) // only A contributes
  })

  it('returns 0 for empty inputs', () => {
    expect(calculateIndexValue({}, {})).toBe(0)
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
    expect(result[1].date).toBe('2025-01-03')
  })

  it('uses market-cap weights for each day', () => {
    const historicalData = {
      'A': [
        { date: '2025-01-02', close: 100, marketCap: 900 },
        { date: '2025-01-03', close: 110, marketCap: 990 },
      ],
      'B': [
        { date: '2025-01-02', close: 100, marketCap: 100 },
        { date: '2025-01-03', close: 90, marketCap: 90 },
      ],
    }
    const result = calculateHistoricalIndex(historicalData, '2025-01-02')
    // Day 2 market caps: A=990, B=90, total=1080
    // A weight = 990/1080 ≈ 91.67%, gained 10% => +9.167
    // B weight = 90/1080 ≈ 8.33%, lost 10% => -0.833
    // Weighted change = +8.333
    // Index value = 100 + 8.333 = 108.333
    expect(result[1].value).toBeCloseTo(108.33, 1)
  })

  it('returns empty for invalid baseline date', () => {
    const historicalData = {
      'A': [{ date: '2025-01-02', close: 100, marketCap: 1000 }],
    }
    const result = calculateHistoricalIndex(historicalData, '2099-01-01')
    expect(result).toHaveLength(0)
  })

  it('returns empty for empty input', () => {
    expect(calculateHistoricalIndex({}, '2025-01-02')).toHaveLength(0)
  })
})
