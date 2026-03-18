import { NewsItem } from '@/components/news-item'
import type { NewsArticle } from '@/components/news-item'

interface NewsFeedProps {
  articles: NewsArticle[]
  sectorMap?: Record<string, { name: string; color: string }>
}

export function NewsFeed({ articles }: NewsFeedProps) {
  return (
    <div>
      {/* Section label */}
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
        LATEST NEWS
      </div>

      {/* News list container */}
      <div
        style={{
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: 'var(--dash-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
        }}
      >
        {articles.map((article, index) => (
          <NewsItem key={`${article.link}-${index}`} article={article} />
        ))}
      </div>
    </div>
  )
}
