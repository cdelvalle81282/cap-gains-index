'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RATING_COLORS } from '@/lib/theme-config'

export interface StockTableRow {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  weight: number
  rating: string
}

type SortKey = 'ticker' | 'name' | 'price' | 'changePercent' | 'marketCap' | 'weight'
type SortDir = 'asc' | 'desc'

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}

export function StockTable({ stocks, sectorSlug }: { stocks: StockTableRow[]; sectorSlug: string }) {
  const [sortKey, setSortKey] = useState<SortKey>('weight')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'ticker' || key === 'name' ? 'asc' : 'desc')
    }
  }

  const sorted = [...stocks].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const headerStyle = (key: SortKey) => ({
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    color: sortKey === key ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer',
    borderBottom: '1px solid var(--dash-border)',
    textAlign: 'left' as const,
    userSelect: 'none' as const,
  })

  return (
    <div style={{ borderRadius: '10px', border: '1px solid var(--dash-border)', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <th style={headerStyle('ticker')} onClick={() => handleSort('ticker')}>
              Ticker {sortKey === 'ticker' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
            </th>
            <th style={headerStyle('name')} onClick={() => handleSort('name')}>
              Name {sortKey === 'name' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
            </th>
            <th style={{ ...headerStyle('price'), textAlign: 'right' }} onClick={() => handleSort('price')}>
              Price {sortKey === 'price' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
            </th>
            <th style={{ ...headerStyle('changePercent'), textAlign: 'right' }} onClick={() => handleSort('changePercent')}>
              Change {sortKey === 'changePercent' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
            </th>
            <th style={{ ...headerStyle('marketCap'), textAlign: 'right' }} onClick={() => handleSort('marketCap')}>
              Market Cap {sortKey === 'marketCap' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
            </th>
            <th style={{ ...headerStyle('weight'), textAlign: 'right' }} onClick={() => handleSort('weight')}>
              Weight {sortKey === 'weight' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
            </th>
            <th style={{ ...headerStyle('ticker'), cursor: 'default', textAlign: 'center' }}>
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((stock) => {
            const ratingKey = stock.rating.toLowerCase() as keyof typeof RATING_COLORS
            const ratingColor = RATING_COLORS[ratingKey] || RATING_COLORS.hold
            return (
              <tr
                key={stock.ticker}
                style={{ borderBottom: '1px solid var(--dash-border)', transition: 'background 150ms ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <td style={{ padding: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  <Link href={`/stock/${stock.ticker}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {stock.ticker}
                  </Link>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Link href={`/stock/${stock.ticker}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {stock.name}
                  </Link>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--text-primary)' }}>
                  ${stock.price.toFixed(2)}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 600, color: stock.changePercent >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  {formatMarketCap(stock.marketCap)}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  {(stock.weight * 100).toFixed(2)}%
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    backgroundColor: ratingColor.bg,
                    color: ratingColor.text,
                    letterSpacing: '0.5px',
                  }}>
                    {stock.rating}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
