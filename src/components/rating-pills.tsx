import { RATING_COLORS } from '@/lib/theme-config'

interface RatingPillsProps {
  ratings: {
    buy: number
    hold: number
    sell: number
    short: number
  }
}

const RATING_LABELS: Array<{ key: keyof RatingPillsProps['ratings']; label: string }> = [
  { key: 'buy', label: 'BUY' },
  { key: 'hold', label: 'HOLD' },
  { key: 'sell', label: 'SELL' },
  { key: 'short', label: 'SHORT' },
]

export function RatingPills({ ratings }: RatingPillsProps) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {RATING_LABELS.map(({ key, label }) => {
        const count = ratings[key]
        if (count <= 0) return null
        const colors = RATING_COLORS[key]
        return (
          <span
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
              letterSpacing: '0.5px',
              backgroundColor: colors.bg,
              color: colors.text,
            }}
          >
            {count} {label}
          </span>
        )
      })}
    </div>
  )
}
