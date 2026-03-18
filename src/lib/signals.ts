import { RSI, MACD, SMA } from 'technicalindicators'

export interface IndicatorScore {
  name: string
  score: number // -1 to 1
  weight: number
}

export interface CompositeSignal {
  score: number
  label: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  indicators: IndicatorScore[]
}

export interface MACDResult {
  macd: number
  signal: number
  histogram: number
}

export function calculateRSI(closes: number[], period: number = 14): number {
  const result = RSI.calculate({ values: closes, period })
  return result.length > 0 ? result[result.length - 1] : 50
}

export function calculateMovingAverage(
  closes: number[],
  period: number
): number {
  if (closes.length < period) return NaN
  const result = SMA.calculate({ values: closes, period })
  return result.length > 0 ? result[result.length - 1] : NaN
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const result = MACD.calculate({
    values: closes,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  })
  const last = result[result.length - 1]
  return {
    macd: last?.MACD ?? 0,
    signal: last?.signal ?? 0,
    histogram: last?.histogram ?? 0,
  }
}

export function isGoldenCross(
  closes: number[],
  fastPeriod: number = 20,
  slowPeriod: number = 50
): boolean {
  if (closes.length < slowPeriod + 1) return false
  const fastMA = SMA.calculate({ values: closes, period: fastPeriod })
  const slowMA = SMA.calculate({ values: closes, period: slowPeriod })
  if (fastMA.length < 2 || slowMA.length < 2) return false
  const prevFast = fastMA[fastMA.length - 2]
  const currFast = fastMA[fastMA.length - 1]
  const prevSlow = slowMA[slowMA.length - 2]
  const currSlow = slowMA[slowMA.length - 1]
  return prevFast <= prevSlow && currFast > currSlow
}

export function isDeathCross(
  closes: number[],
  fastPeriod: number = 20,
  slowPeriod: number = 50
): boolean {
  if (closes.length < slowPeriod + 1) return false
  const fastMA = SMA.calculate({ values: closes, period: fastPeriod })
  const slowMA = SMA.calculate({ values: closes, period: slowPeriod })
  if (fastMA.length < 2 || slowMA.length < 2) return false
  const prevFast = fastMA[fastMA.length - 2]
  const currFast = fastMA[fastMA.length - 1]
  const prevSlow = slowMA[slowMA.length - 2]
  const currSlow = slowMA[slowMA.length - 1]
  return prevFast >= prevSlow && currFast < currSlow
}

export function detectVolumeSpike(
  volumes: number[],
  threshold: number = 2.0
): boolean {
  if (volumes.length < 21) return false
  const recent = volumes.slice(-20, -1)
  const avgVolume = recent.reduce((a, b) => a + b, 0) / recent.length
  const latestVolume = volumes[volumes.length - 1]
  return latestVolume > avgVolume * threshold
}

// Convert RSI to a -1 to 1 score
export function rsiToScore(
  rsi: number,
  oversold: number = 30,
  overbought: number = 70
): number {
  if (rsi <= oversold) return 1.0 // Very bullish (oversold = buying opportunity)
  if (rsi >= overbought) return -1.0 // Very bearish (overbought = sell signal)
  // Linear interpolation between oversold and overbought
  const midpoint = (oversold + overbought) / 2
  return -(rsi - midpoint) / (overbought - midpoint)
}

export function calculateCompositeSignal(
  indicators: IndicatorScore[]
): CompositeSignal {
  if (indicators.length === 0) {
    return { score: 0, label: 'Hold', indicators: [] }
  }
  const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0)
  const weightedScore =
    indicators.reduce((sum, ind) => sum + ind.score * ind.weight, 0) /
    totalWeight

  // Clamp to [-1, 1]
  const score = Math.max(-1, Math.min(1, weightedScore))

  let label: CompositeSignal['label']
  if (score > 0.6) label = 'Strong Buy'
  else if (score > 0.2) label = 'Buy'
  else if (score > -0.2) label = 'Hold'
  else if (score > -0.6) label = 'Sell'
  else label = 'Strong Sell'

  return { score, label, indicators }
}
