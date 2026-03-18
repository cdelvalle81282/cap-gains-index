import { NextRequest, NextResponse } from 'next/server'
import { calculateRSI, calculateMACD, calculateMovingAverage, rsiToScore, calculateCompositeSignal, detectVolumeSpike } from '@/lib/signals'
import type { IndicatorScore } from '@/lib/signals'
import { DEFAULT_BACKTEST_CONFIG } from '@/lib/backtest'
import { prisma } from '@/lib/db'

export const revalidate = 300

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 })
  }

  // Try to load active signal config from DB, fall back to defaults
  let config = DEFAULT_BACKTEST_CONFIG
  const savedConfig = await prisma.signalConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  if (savedConfig) {
    config = JSON.parse(savedConfig.parameters)
  }

  // Generate mock price/volume data (deterministic per ticker)
  const { closes, volumes } = generateMockSignalData(ticker)

  const indicators: IndicatorScore[] = []

  if (config.rsi.enabled) {
    const rsi = calculateRSI(closes, config.rsi.period)
    indicators.push({
      name: 'RSI',
      score: rsiToScore(rsi, config.rsi.oversold, config.rsi.overbought),
      weight: config.rsi.weight,
    })
  }

  if (config.ma.enabled) {
    const fastMA = calculateMovingAverage(closes, config.ma.fast)
    const slowMA = calculateMovingAverage(closes, config.ma.slow)
    if (!isNaN(fastMA) && !isNaN(slowMA)) {
      indicators.push({
        name: 'MA Crossover',
        score: fastMA > slowMA ? 0.5 : -0.5,
        weight: config.ma.weight,
      })
    }
  }

  if (config.macd.enabled) {
    const macd = calculateMACD(closes, config.macd.fast, config.macd.slow, config.macd.signal)
    indicators.push({
      name: 'MACD',
      score: macd.histogram > 0 ? 0.5 : -0.5,
      weight: config.macd.weight,
    })
  }

  if (config.volumeSpike.enabled && detectVolumeSpike(volumes, config.volumeSpike.threshold)) {
    const trendUp = closes[closes.length - 1] > closes[closes.length - 2]
    indicators.push({
      name: 'Volume',
      score: trendUp ? 0.3 : -0.3,
      weight: config.volumeSpike.weight,
    })
  }

  const composite = calculateCompositeSignal(indicators)

  return NextResponse.json({
    ticker: ticker.toUpperCase(),
    composite,
  })
}

function generateMockSignalData(ticker: string): { closes: number[]; volumes: number[] } {
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

  const closes: number[] = []
  const volumes: number[] = []
  let price = 50 + rng() * 200

  for (let i = 0; i < 200; i++) {
    price += (rng() - 0.5) * 3 + Math.sin(i * 0.05) * 1.5
    price = Math.max(10, price)
    closes.push(Math.round(price * 100) / 100)
    volumes.push(Math.floor(500000 + rng() * 2000000))
  }

  return { closes, volumes }
}
