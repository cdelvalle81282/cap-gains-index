import { describe, it, expect } from 'vitest'
import { fetchQuote, fetchHistoricalData } from './yahoo-finance'

describe('yahoo-finance', () => {
  it('fetchQuote returns structured quote data', async () => {
    const quote = await fetchQuote('AAPL')
    expect(quote).toHaveProperty('ticker')
    expect(quote).toHaveProperty('price')
    expect(quote).toHaveProperty('change')
    expect(quote).toHaveProperty('changePercent')
    expect(quote).toHaveProperty('marketCap')
  }, 15000)

  it('fetchHistoricalData returns array of daily candles', async () => {
    const data = await fetchHistoricalData('AAPL', '6mo')
    expect(Array.isArray(data)).toBe(true)
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('date')
      expect(data[0]).toHaveProperty('close')
    }
  }, 15000)
})
