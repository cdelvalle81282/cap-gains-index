import { RATING_COLORS } from '@/lib/theme-config'

interface RatingDisplayProps {
  rating: string
  notes: string | null
  lastReviewed: string | null
}

export function RatingDisplay({ rating, notes, lastReviewed }: RatingDisplayProps) {
  const ratingKey = rating.toLowerCase() as keyof typeof RATING_COLORS
  const ratingColor = RATING_COLORS[ratingKey] || RATING_COLORS.hold

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
        ANALYST RATING
      </div>

      <div
        style={{
          borderRadius: '10px',
          border: '1px solid var(--dash-border)',
          backgroundColor: 'var(--bg-card)',
          padding: '24px',
        }}
      >
        {/* Large centered badge */}
        <div style={{ textAlign: 'center', marginBottom: notes ? '20px' : '0' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '8px 24px',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '6px',
              backgroundColor: ratingColor.bg,
              color: ratingColor.text,
            }}
          >
            {rating}
          </span>
        </div>

        {/* Notes / thesis */}
        {notes && (
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              marginBottom: lastReviewed ? '12px' : '0',
            }}
          >
            {notes}
          </div>
        )}

        {/* Last reviewed date */}
        {lastReviewed && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Last reviewed: {lastReviewed}
          </div>
        )}
      </div>
    </div>
  )
}
