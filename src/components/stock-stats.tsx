'use client'

interface StockStatsProps {
  stats: {
    marketCap: number
    pe: number | null
    high52w: number
    low52w: number
    volume: number
    dividendYield: number | null
  }
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}

function formatVolume(vol: number): string {
  return vol.toLocaleString('en-US')
}

const statItems = [
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'pe', label: 'P/E Ratio' },
  { key: 'high52w', label: '52-Week High' },
  { key: 'low52w', label: '52-Week Low' },
  { key: 'volume', label: 'Volume' },
  { key: 'dividendYield', label: 'Dividend Yield' },
] as const

export function StockStats({ stats }: StockStatsProps) {
  function formatValue(key: typeof statItems[number]['key']): string {
    switch (key) {
      case 'marketCap':
        return formatMarketCap(stats.marketCap)
      case 'pe':
        return stats.pe !== null ? stats.pe.toFixed(2) : 'N/A'
      case 'high52w':
        return `$${stats.high52w.toFixed(2)}`
      case 'low52w':
        return `$${stats.low52w.toFixed(2)}`
      case 'volume':
        return formatVolume(stats.volume)
      case 'dividendYield':
        return stats.dividendYield !== null ? `${stats.dividendYield.toFixed(2)}%` : 'N/A'
    }
  }

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        KEY STATISTICS
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        {statItems.map((item) => (
          <div
            key={item.key}
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--dash-border)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
              }}
            >
              {formatValue(item.key)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
