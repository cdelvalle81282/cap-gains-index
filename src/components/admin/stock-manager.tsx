'use client'

import { useState, useCallback } from 'react'

interface Stock {
  id: string
  ticker: string
  name: string
  manualRating: string
}

interface SectorWithStocks {
  id: string
  name: string
  slug: string
  color: string
  stocks: Stock[]
}

export function StockManager({ initialData }: { initialData: SectorWithStocks[] }) {
  const [sectors, setSectors] = useState(initialData)
  const [filter, setFilter] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Add stock form state
  const [newTicker, setNewTicker] = useState('')
  const [newName, setNewName] = useState('')
  const [newSectorSlug, setNewSectorSlug] = useState(initialData[0]?.slug || '')
  const [addError, setAddError] = useState('')

  const toggleSection = (sectorId: string) => {
    setCollapsed(prev => ({ ...prev, [sectorId]: !prev[sectorId] }))
  }

  const addStock = useCallback(async () => {
    if (!newTicker.trim() || !newName.trim() || !newSectorSlug) {
      setAddError('All fields are required.')
      return
    }

    setAddError('')
    const ticker = newTicker.trim().toUpperCase()
    const name = newName.trim()

    // Optimistic update
    const targetSector = sectors.find(s => s.slug === newSectorSlug)
    if (!targetSector) return

    const tempStock: Stock = {
      id: 'temp-' + Date.now(),
      ticker,
      name,
      manualRating: 'hold',
    }

    setSectors(prev => prev.map(sector =>
      sector.slug === newSectorSlug
        ? { ...sector, stocks: [...sector.stocks, tempStock].sort((a, b) => a.ticker.localeCompare(b.ticker)) }
        : sector
    ))

    // Clear form
    setNewTicker('')
    setNewName('')

    try {
      const res = await fetch('/api/admin/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, name, sectorSlug: newSectorSlug }),
      })

      if (!res.ok) {
        const data = await res.json()
        setAddError(data.error || 'Failed to add stock.')
        // Revert optimistic update
        setSectors(prev => prev.map(sector =>
          sector.slug === newSectorSlug
            ? { ...sector, stocks: sector.stocks.filter(s => s.id !== tempStock.id) }
            : sector
        ))
        return
      }

      const created = await res.json()
      // Replace temp stock with real one
      setSectors(prev => prev.map(sector =>
        sector.slug === newSectorSlug
          ? { ...sector, stocks: sector.stocks.map(s => s.id === tempStock.id ? { ...created } : s) }
          : sector
      ))
    } catch (err) {
      console.error('Failed to add stock:', err)
      setAddError('Network error.')
      // Revert
      setSectors(prev => prev.map(sector =>
        sector.slug === newSectorSlug
          ? { ...sector, stocks: sector.stocks.filter(s => s.id !== tempStock.id) }
          : sector
      ))
    }
  }, [newTicker, newName, newSectorSlug, sectors])

  const reassignStock = useCallback(async (ticker: string, currentSectorId: string, newSlug: string) => {
    const newSector = sectors.find(s => s.slug === newSlug)
    if (!newSector || newSector.id === currentSectorId) return

    setSaving(prev => ({ ...prev, [ticker]: true }))

    // Optimistic update: move stock between sectors
    let movedStock: Stock | null = null
    setSectors(prev => {
      const updated = prev.map(sector => {
        if (sector.id === currentSectorId) {
          const stock = sector.stocks.find(s => s.ticker === ticker)
          if (stock) movedStock = stock
          return { ...sector, stocks: sector.stocks.filter(s => s.ticker !== ticker) }
        }
        return sector
      })

      if (movedStock) {
        return updated.map(sector =>
          sector.slug === newSlug
            ? { ...sector, stocks: [...sector.stocks, movedStock!].sort((a, b) => a.ticker.localeCompare(b.ticker)) }
            : sector
        )
      }
      return updated
    })

    try {
      const res = await fetch('/api/admin/stocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, newSectorSlug: newSlug }),
      })

      if (!res.ok) {
        console.error('Failed to reassign stock')
        // Revert: refetch
        const refetch = await fetch('/api/admin/stocks')
        if (refetch.ok) setSectors(await refetch.json())
      }
    } catch (err) {
      console.error('Failed to reassign stock:', err)
      const refetch = await fetch('/api/admin/stocks')
      if (refetch.ok) setSectors(await refetch.json())
    } finally {
      setSaving(prev => ({ ...prev, [ticker]: false }))
    }
  }, [sectors])

  const deleteStock = useCallback(async (ticker: string, sectorId: string) => {
    if (!window.confirm(`Delete ${ticker}? This cannot be undone.`)) return

    setSaving(prev => ({ ...prev, [ticker]: true }))

    // Optimistic update
    setSectors(prev => prev.map(sector =>
      sector.id === sectorId
        ? { ...sector, stocks: sector.stocks.filter(s => s.ticker !== ticker) }
        : sector
    ))

    try {
      const res = await fetch('/api/admin/stocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      })

      if (!res.ok) {
        console.error('Failed to delete stock')
        const refetch = await fetch('/api/admin/stocks')
        if (refetch.ok) setSectors(await refetch.json())
      }
    } catch (err) {
      console.error('Failed to delete stock:', err)
      const refetch = await fetch('/api/admin/stocks')
      if (refetch.ok) setSectors(await refetch.json())
    } finally {
      setSaving(prev => ({ ...prev, [ticker]: false }))
    }
  }, [])

  const filterLower = filter.toLowerCase()

  return (
    <div>
      {/* Add Stock form */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--dash-border)',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Add Stock
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticker</label>
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              placeholder="AAPL"
              style={{
                width: '100px',
                padding: '8px 10px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--dash-border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Apple Inc."
              style={{
                padding: '8px 10px',
                fontSize: '13px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--dash-border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sector</label>
            <select
              value={newSectorSlug}
              onChange={(e) => setNewSectorSlug(e.target.value)}
              style={{
                padding: '8px 10px',
                fontSize: '13px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--dash-border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                appearance: 'auto',
              }}
            >
              {sectors.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={addStock}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
        {addError && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>
            {addError}
          </div>
        )}
      </div>

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
                {filteredStocks.map((stock, idx) => (
                  <div
                    key={stock.ticker}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 160px 40px',
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

                    {/* Sector reassignment dropdown */}
                    <select
                      value={sector.slug}
                      onChange={(e) => reassignStock(stock.ticker, sector.id, e.target.value)}
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--dash-border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        appearance: 'auto',
                      }}
                    >
                      {sectors.map(s => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                    </select>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteStock(stock.ticker, sector.id)}
                      title={`Delete ${stock.ticker}`}
                      style={{
                        padding: '4px 8px',
                        fontSize: '14px',
                        lineHeight: 1,
                        backgroundColor: 'transparent',
                        border: '1px solid var(--dash-border)',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
