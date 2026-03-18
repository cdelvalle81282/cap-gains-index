'use client'

import { useState, useCallback } from 'react'
import { RATING_COLORS } from '@/lib/theme-config'

interface Stock {
  id: string
  ticker: string
  name: string
  manualRating: string
  notes: string | null
  lastReviewedAt: string | null
}

interface SectorWithStocks {
  id: string
  name: string
  slug: string
  color: string
  stocks: Stock[]
}

const RATINGS = ['buy', 'hold', 'sell', 'short'] as const

export function RatingEditor({ initialData }: { initialData: SectorWithStocks[] }) {
  const [sectors, setSectors] = useState(initialData)
  const [filter, setFilter] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const toggleSection = (sectorId: string) => {
    setCollapsed(prev => ({ ...prev, [sectorId]: !prev[sectorId] }))
  }

  const updateRating = useCallback(async (ticker: string, rating: string) => {
    setSaving(prev => ({ ...prev, [ticker]: true }))

    // Optimistic update
    setSectors(prev => prev.map(sector => ({
      ...sector,
      stocks: sector.stocks.map(stock =>
        stock.ticker === ticker
          ? { ...stock, manualRating: rating, lastReviewedAt: new Date().toISOString() }
          : stock
      ),
    })))

    try {
      await fetch('/api/admin/ratings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, rating }),
      })
    } catch (err) {
      console.error('Failed to update rating:', err)
    } finally {
      setSaving(prev => ({ ...prev, [ticker]: false }))
    }
  }, [])

  const updateNotes = useCallback(async (ticker: string, notes: string) => {
    setSaving(prev => ({ ...prev, [ticker + '-notes']: true }))

    // Optimistic update
    setSectors(prev => prev.map(sector => ({
      ...sector,
      stocks: sector.stocks.map(stock =>
        stock.ticker === ticker
          ? { ...stock, notes, lastReviewedAt: new Date().toISOString() }
          : stock
      ),
    })))

    try {
      await fetch('/api/admin/ratings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, notes }),
      })
    } catch (err) {
      console.error('Failed to update notes:', err)
    } finally {
      setSaving(prev => ({ ...prev, [ticker + '-notes']: false }))
    }
  }, [])

  const filterLower = filter.toLowerCase()

  return (
    <div>
      {/* Search/filter bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by ticker or name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 14px',
            fontSize: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--dash-border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      </div>

      {/* Sector groups */}
      {sectors.map(sector => {
        const filteredStocks = sector.stocks.filter(s =>
          !filterLower ||
          s.ticker.toLowerCase().includes(filterLower) ||
          s.name.toLowerCase().includes(filterLower)
        )

        if (filteredStocks.length === 0) return null

        const isCollapsed = collapsed[sector.id]

        return (
          <div key={sector.id} style={{ marginBottom: '24px' }}>
            {/* Sector header */}
            <button
              onClick={() => toggleSection(sector.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--dash-border)',
                borderRadius: isCollapsed ? '8px' : '8px 8px 0 0',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ color: sector.color, fontSize: '18px' }}>
                {isCollapsed ? '\u25B8' : '\u25BE'}
              </span>
              <span>{sector.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {filteredStocks.length} stocks
              </span>
            </button>

            {/* Stock rows */}
            {!isCollapsed && (
              <div style={{ border: '1px solid var(--dash-border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                {filteredStocks.map((stock, idx) => {
                  const ratingKey = stock.manualRating.toLowerCase() as keyof typeof RATING_COLORS
                  const ratingColor = RATING_COLORS[ratingKey] || RATING_COLORS.hold

                  return (
                    <div
                      key={stock.ticker}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 120px 1fr 140px',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '10px 16px',
                        backgroundColor: 'var(--bg-card)',
                        borderBottom: idx < filteredStocks.length - 1 ? '1px solid var(--dash-border)' : 'none',
                      }}
                    >
                      {/* Ticker */}
                      <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {stock.ticker}
                        {saving[stock.ticker] && <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginLeft: '4px' }}>...</span>}
                      </span>

                      {/* Name */}
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {stock.name}
                      </span>

                      {/* Rating dropdown */}
                      <select
                        value={stock.manualRating.toLowerCase()}
                        onChange={(e) => updateRating(stock.ticker, e.target.value)}
                        style={{
                          padding: '6px 8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          backgroundColor: ratingColor.bg,
                          color: ratingColor.text,
                          border: '1px solid transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          appearance: 'auto',
                        }}
                      >
                        {RATINGS.map(r => (
                          <option key={r} value={r} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                            {r.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      {/* Notes input */}
                      <input
                        type="text"
                        defaultValue={stock.notes || ''}
                        placeholder="Add notes..."
                        onBlur={(e) => {
                          const val = e.target.value
                          if (val !== (stock.notes || '')) {
                            updateNotes(stock.ticker, val)
                          }
                        }}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--dash-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />

                      {/* Last reviewed */}
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>
                        {stock.lastReviewedAt
                          ? new Date(stock.lastReviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Not reviewed'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
