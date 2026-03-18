import { calculateRSI, calculateMACD, calculateMovingAverage, rsiToScore, calculateCompositeSignal, detectVolumeSpike } from './signals'
import type { IndicatorScore } from './signals'

export interface BacktestConfig {
  rsi: { period: number; oversold: number; overbought: number; weight: number; enabled: boolean }
  ma: { fast: number; slow: number; weight: number; enabled: boolean }
  macd: { fast: number; slow: number; signal: number; weight: number; enabled: boolean }
  volumeSpike: { threshold: number; weight: number; enabled: boolean }
}

export interface BacktestTrade {
  date: string
  action: 'buy' | 'sell'
  price: number
  signal: number
}

export interface BacktestResultData {
  accuracy: number
  returnPercent: number
  buyAndHoldReturn: number
  winLossRatio: number
  totalTrades: number
  trades: BacktestTrade[]
}

export interface HistoricalBar {
  date: string
  close: number
  volume: number
}

export function runBacktest(data: HistoricalBar[], config: BacktestConfig): BacktestResultData {
  // Need at least 60 bars for meaningful signals
  if (data.length < 60) {
    return { accuracy: 0, returnPercent: 0, buyAndHoldReturn: 0, winLossRatio: 0, totalTrades: 0, trades: [] }
  }

  const closes = data.map(d => d.close)
  const volumes = data.map(d => d.volume)
  const trades: BacktestTrade[] = []
  let position: 'long' | 'flat' = 'flat'
  let entryPrice = 0
  let wins = 0
  let losses = 0
  let totalReturn = 0

  // Walk through data starting after warmup period (50 bars)
  for (let i = 50; i < data.length; i++) {
    const slice = closes.slice(0, i + 1)
    const volSlice = volumes.slice(0, i + 1)

    const indicators: IndicatorScore[] = []

    if (config.rsi.enabled) {
      const rsi = calculateRSI(slice, config.rsi.period)
      indicators.push({ name: 'RSI', score: rsiToScore(rsi, config.rsi.oversold, config.rsi.overbought), weight: config.rsi.weight })
    }

    if (config.ma.enabled) {
      const fastMA = calculateMovingAverage(slice, config.ma.fast)
      const slowMA = calculateMovingAverage(slice, config.ma.slow)
      if (!isNaN(fastMA) && !isNaN(slowMA)) {
        const maScore = fastMA > slowMA ? 0.5 : -0.5
        indicators.push({ name: 'MA Crossover', score: maScore, weight: config.ma.weight })
      }
    }

    if (config.macd.enabled) {
      const macd = calculateMACD(slice, config.macd.fast, config.macd.slow, config.macd.signal)
      const macdScore = macd.histogram > 0 ? 0.5 : -0.5
      indicators.push({ name: 'MACD', score: macdScore, weight: config.macd.weight })
    }

    if (config.volumeSpike.enabled) {
      const spike = detectVolumeSpike(volSlice, config.volumeSpike.threshold)
      if (spike) {
        // Volume spike confirms the current trend direction
        const trendUp = closes[i] > closes[i - 1]
        indicators.push({ name: 'Volume', score: trendUp ? 0.3 : -0.3, weight: config.volumeSpike.weight })
      }
    }

    if (indicators.length === 0) continue

    const signal = calculateCompositeSignal(indicators)

    // Trading logic
    if (position === 'flat' && signal.score > 0.3) {
      position = 'long'
      entryPrice = data[i].close
      trades.push({ date: data[i].date, action: 'buy', price: entryPrice, signal: signal.score })
    } else if (position === 'long' && signal.score < -0.1) {
      position = 'flat'
      const exitPrice = data[i].close
      const tradeReturn = (exitPrice - entryPrice) / entryPrice * 100
      totalReturn += tradeReturn
      if (tradeReturn > 0) wins++
      else losses++
      trades.push({ date: data[i].date, action: 'sell', price: exitPrice, signal: signal.score })
    }
  }

  // Close any open position
  if (position === 'long') {
    const exitPrice = data[data.length - 1].close
    const tradeReturn = (exitPrice - entryPrice) / entryPrice * 100
    totalReturn += tradeReturn
    if (tradeReturn > 0) wins++
    else losses++
    trades.push({ date: data[data.length - 1].date, action: 'sell', price: exitPrice, signal: 0 })
  }

  const totalTrades = wins + losses
  const buyAndHoldReturn = ((data[data.length - 1].close - data[50].close) / data[50].close) * 100

  return {
    accuracy: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    returnPercent: Math.round(totalReturn * 100) / 100,
    buyAndHoldReturn: Math.round(buyAndHoldReturn * 100) / 100,
    winLossRatio: losses > 0 ? Math.round((wins / losses) * 100) / 100 : wins,
    totalTrades,
    trades,
  }
}

export const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
  rsi: { period: 14, oversold: 30, overbought: 70, weight: 1, enabled: true },
  ma: { fast: 20, slow: 50, weight: 1, enabled: true },
  macd: { fast: 12, slow: 26, signal: 9, weight: 1, enabled: true },
  volumeSpike: { threshold: 2.0, weight: 0.5, enabled: false },
}
