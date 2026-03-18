'use client'

export interface NewsArticle {
  title: string
  link: string
  pubDate: string
  source: string
  sector?: string
  sectorColor?: string
}

const SECTOR_TAG_COLORS: Record<string, { bg: string; text: string }> = {
  defense: { bg: 'rgba(77,124,255,0.12)', text: '#4d7cff' },
  energy: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  crypto: { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' },
  'ai-semi': { bg: 'rgba(6,182,212,0.12)', text: '#06b6d4' },
  commodities: { bg: 'rgba(0,212,170,0.12)', text: '#00d4aa' },
  'broad-etfs': { bg: 'rgba(139,141,163,0.12)', text: '#8b8da3' },
}

function getRelativeTime(pubDate: string): string {
  const now = new Date()
  const published = new Date(pubDate)
  const diffMs = now.getTime() - published.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

interface NewsItemProps {
  article: NewsArticle
}

export function NewsItem({ article }: NewsItemProps) {
  const sectorTag = article.sector
    ? SECTOR_TAG_COLORS[article.sector] || null
    : null

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-card)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background-color 150ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)'
      }}
    >
      {/* Colored dot */}
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: article.sectorColor || 'var(--text-muted)',
          flexShrink: 0,
        }}
      />

      {/* Headline */}
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {article.title}
      </span>

      {/* Sector tag badge */}
      {article.sector && sectorTag && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: sectorTag.bg,
            color: sectorTag.text,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {article.sector}
        </span>
      )}

      {/* Timestamp */}
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
          color: 'var(--text-muted)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {getRelativeTime(article.pubDate)}
      </span>
    </a>
  )
}
