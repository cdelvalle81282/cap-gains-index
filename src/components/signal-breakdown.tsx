'use client'

import { useState, useEffect } from 'react'

interface IndicatorResult {
  name: string
  score: number
  weight: number
}

interface SignalData {
  ticker: string
  composite: {
    score: number
    label: string
    indicators: IndicatorResult[]
  }
}

const SIGNAL_COLORS: Record<string, string> = {
  'Strong Buy': '#00d4aa',
  'Buy': '#00d4aa',
  'Hold': '#f59e0b',
  'Sell': '#ff4d6a',
  'Strong Sell': '#ff4d6a',
}

export function SignalBreakdown({ ticker }: { ticker: string }) {
  const [data, setData] = useState<SignalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stocks/signals?ticker=${ticker}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [ticker])

  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
        SIGNAL ANALYSIS
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '20px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading signals...</div>
        ) : !data?.composite ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Signal analysis unavailable. Configure signals in the admin panel.
          </div>
        ) : (
          <div>
            {/* Composite score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                padding: '8px 20px',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: SIGNAL_COLORS[data.composite.label] ? `${SIGNAL_COLORS[data.composite.label]}20` : 'var(--bg-secondary)',
                color: SIGNAL_COLORS[data.composite.label] || 'var(--text-primary)',
              }}>
                {data.composite.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Score: {data.composite.score.toFixed(2)}
              </div>
            </div>

            {/* Individual indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.composite.indicators.map((ind) => (
                <div key={ind.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{ind.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Score bar */}
                    <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--dash-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.abs(ind.score) * 50 + 50}%`,
                        height: '100%',
                        backgroundColor: ind.score >= 0 ? 'var(--green)' : 'var(--red)',
                        borderRadius: '3px',
                        transition: 'width 300ms ease',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: ind.score >= 0 ? 'var(--green)' : 'var(--red)', minWidth: '40px', textAlign: 'right' }}>
                      {ind.score >= 0 ? '+' : ''}{ind.score.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
