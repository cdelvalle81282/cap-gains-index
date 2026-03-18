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
