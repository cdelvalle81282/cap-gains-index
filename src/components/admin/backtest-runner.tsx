'use client'

import { useState } from 'react'
import type { BacktestConfig } from '@/lib/backtest'

interface BacktestRunnerProps {
  config: BacktestConfig
}

interface BacktestResult {
  ticker: string
  period: string
  accuracy: number
  returnPercent: number
  buyAndHoldReturn: number
  winLossRatio: number
  totalTrades: number
  trades: {
    date: string
    action: 'buy' | 'sell'
    price: number
    signal: number
  }[]
}

const PERIODS = ['1Y', '2Y', '3Y', '5Y'] as const

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--dash-border)',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
}

export function BacktestRunner({ config }: BacktestRunnerProps) {
  const [ticker, setTicker] = useState('')
  const [period, setPeriod] = useState<string>('1Y')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRun() {
    if (!ticker.trim()) {
      setError('Enter a ticker symbol')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          config,
          period,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Backtest failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backtest failed')
    } finally {
      setLoading(false)
    }
  }

  const beatsMarket = result ? result.returnPercent > result.buyAndHoldReturn : false

  return (
    <div>
      {/* Ticker Input */}
      <div style={cardStyle}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Ticker Symbol
        </label>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="e.g. AAPL"
          onKeyDown={(e) => { if (e.key === 'Enter') handleRun() }}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--dash-border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            outline: 'none',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        />
      </div>

      {/* Period Selection */}
      <div style={cardStyle}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Backtest Period
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid var(--dash-border)',
                cursor: 'pointer',
                backgroundColor: period === p ? 'rgba(0,212,170,0.15)' : 'var(--bg-secondary)',
                color: period === p ? '#00d4aa' : 'var(--text-secondary)',
                transition: 'all 150ms ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: loading ? 'rgba(6,182,212,0.4)' : '#06b6d4',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '16px',
          transition: 'all 150ms ease',
        }}
      >
        {loading ? 'Running Backtest...' : 'Run Backtest'}
      </button>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            fontSize: '13px',
            color: '#ff4d6a',
            backgroundColor: 'rgba(255,77,106,0.08)',
            border: '1px solid rgba(255,77,106,0.2)',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Summary Metrics */}
          <div style={cardStyle}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}
            >
              Results: {result.ticker} ({result.period})
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              {/* Accuracy */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Win Rate
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: result.accuracy >= 50 ? '#00d4aa' : '#ff4d6a',
                  }}
                >
                  {result.accuracy.toFixed(1)}%
                </div>
              </div>

              {/* Strategy Return */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Strategy Return
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: beatsMarket ? '#00d4aa' : '#ff4d6a',
                  }}
                >
                  {result.returnPercent > 0 ? '+' : ''}{result.returnPercent}%
                </div>
              </div>

              {/* Buy & Hold */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Buy &amp; Hold
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {result.buyAndHoldReturn > 0 ? '+' : ''}{result.buyAndHoldReturn}%
                </div>
              </div>

              {/* Win/Loss Ratio */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  W/L Ratio
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {result.winLossRatio}
                </div>
              </div>
            </div>

            {/* Total Trades */}
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              Total Trades: <strong style={{ color: 'var(--text-primary)' }}>{result.totalTrades}</strong>
              {' '} | Alpha vs B&H:{' '}
              <strong style={{ color: beatsMarket ? '#00d4aa' : '#ff4d6a' }}>
                {(result.returnPercent - result.buyAndHoldReturn) > 0 ? '+' : ''}
                {(result.returnPercent - result.buyAndHoldReturn).toFixed(2)}%
              </strong>
            </div>
          </div>

          {/* Trade History */}
          {result.trades.length > 0 && (
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                }}
              >
                Trade History
              </div>

              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  borderRadius: '6px',
                  border: '1px solid var(--dash-border)',
                }}
              >
                {result.trades.map((trade, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '12px',
                      backgroundColor: 'var(--bg-card)',
                      borderBottom: idx < result.trades.length - 1 ? '1px solid var(--dash-border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: trade.action === 'buy' ? '#00d4aa' : '#ff4d6a',
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: trade.action === 'buy' ? '#00d4aa' : '#ff4d6a',
                          minWidth: '32px',
                        }}
                      >
                        {trade.action}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      ${trade.price.toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                      }}
                    >
                      {trade.date}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                      }}
                    >
                      sig: {trade.signal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
