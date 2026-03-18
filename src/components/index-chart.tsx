'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TimeRangeSelector } from './time-range-selector'

interface IndexChartProps {
  data: { date: string; value: number }[]
  color: string
  title?: string
}

function filterByRange(data: { date: string; value: number }[], range: string) {
  const now = new Date()
  const cutoff = new Date()
  switch (range) {
    case '1M': cutoff.setMonth(now.getMonth() - 1); break
    case '3M': cutoff.setMonth(now.getMonth() - 3); break
    case '6M': cutoff.setMonth(now.getMonth() - 6); break
    case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break
    case '2Y': cutoff.setFullYear(now.getFullYear() - 2); break
  }
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return data.filter(d => d.date >= cutoffStr)
}

export function IndexChart({ data, color, title }: IndexChartProps) {
  const [range, setRange] = useState('6M')
  const filtered = filterByRange(data, range)

  const startValue = filtered.length > 0 ? filtered[0].value : 100
  const endValue = filtered.length > 0 ? filtered[filtered.length - 1].value : 100
  const totalChange = ((endValue - startValue) / startValue * 100)
  const isPositive = totalChange >= 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          {title && (
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {title}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {endValue.toFixed(2)}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: isPositive ? 'var(--green)' : 'var(--red)' }}>
              {isPositive ? '+' : ''}{totalChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <TimeRangeSelector selected={range} onChange={setRange} />
      </div>

      <div style={{ width: '100%', height: 350, backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--dash-border)', padding: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const date = new Date(d)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v) => v.toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--dash-border)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
              formatter={(value) => [Number(value).toFixed(2), 'Index']}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color.replace('#', '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
