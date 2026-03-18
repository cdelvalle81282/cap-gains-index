import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SECTOR_COLORS } from '@/lib/theme-config'
import { IndexChart } from '@/components/index-chart'
import { StockStats } from '@/components/stock-stats'
import { RatingDisplay } from '@/components/rating-display'
import { SignalBreakdown } from '@/components/signal-breakdown'
import { NewsFeed } from '@/components/news-feed'
import type { NewsArticle } from '@/components/news-item'

export const revalidate = 300
export const dynamicParams = true

// Seeded random
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  let state = hash
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function generateMockPriceHistory(ticker: string): { date: string; value: number }[] {
  const rng = seededRandom(ticker + '-price')
  const points: { date: string; value: number }[] = []

  // Start price between $50 and $500
  let value = 50 + rng() * 450
  const trend = (rng() - 0.4) * 0.4

  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 2)

  for (let i = 0; i < 500; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    value += trend + (rng() - 0.5) * 3
    value = Math.max(10, value)
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    })
  }
  return points
}

function generateMockStats(ticker: string) {
  const rng = seededRandom(ticker + '-stats')

  const price = 50 + rng() * 450
  const marketCap = (rng() * 500 + 1) * 1e9
  const pe = rng() > 0.2 ? 5 + rng() * 60 : null
  const high52w = price * (1 + rng() * 0.3)
  const low52w = price * (1 - rng() * 0.3)
  const volume = Math.round((rng() * 50 + 0.5) * 1e6)
  const dividendYield = rng() > 0.4 ? rng() * 5 : null

  return {
    marketCap: Math.round(marketCap),
    pe: pe !== null ? Math.round(pe * 100) / 100 : null,
    high52w: Math.round(high52w * 100) / 100,
    low52w: Math.round(low52w * 100) / 100,
    volume,
    dividendYield: dividendYield !== null ? Math.round(dividendYield * 100) / 100 : null,
  }
}

function generateMockNews(ticker: string, stockName: string, sectorSlug: string, sectorColor: string): NewsArticle[] {
  return [
    {
      title: `${stockName} reports strong quarterly earnings, beats analyst expectations`,
      link: '#',
      pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: 'Reuters',
      sector: sectorSlug,
      sectorColor,
    },
    {
      title: `Institutional investors increase positions in ${ticker} amid sector momentum`,
      link: '#',
      pubDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      source: 'Bloomberg',
      sector: sectorSlug,
      sectorColor,
    },
    {
      title: `${stockName} announces strategic partnership to expand market presence`,
      link: '#',
      pubDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      source: 'MarketWatch',
      sector: sectorSlug,
      sectorColor,
    },
  ]
}

export async function generateStaticParams() {
  try {
    const stocks = await prisma.stock.findMany({ select: { ticker: true } })
    return stocks.map((s) => ({ ticker: s.ticker }))
  } catch {
    return []
  }
}

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params
  const upperTicker = ticker.toUpperCase()

  const stock = await prisma.stock.findUnique({
    where: { ticker: upperTicker },
    include: { sector: true },
  })

  if (!stock) {
    notFound()
  }

  const sectorColor = SECTOR_COLORS[stock.sector.slug] || '#8b8da3'
  const chartData = generateMockPriceHistory(stock.ticker)
  const stats = generateMockStats(stock.ticker)
  const mockNews = generateMockNews(stock.ticker, stock.name, stock.sector.slug, sectorColor)

  const lastReviewed = stock.lastReviewedAt
    ? stock.lastReviewedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/sector/${stock.sector.slug}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        &larr; Back to {stock.sector.name}
      </Link>

      {/* Stock header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {stock.name}
          </h1>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.5px',
            }}
          >
            {stock.ticker}
          </span>
        </div>
        <Link
          href={`/sector/${stock.sector.slug}`}
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderRadius: '4px',
            backgroundColor: `${sectorColor}1f`,
            color: sectorColor,
            textDecoration: 'none',
          }}
        >
          {stock.sector.name}
        </Link>
      </div>

      {/* Price chart */}
      <div style={{ marginBottom: '40px' }}>
        <IndexChart data={chartData} color={sectorColor} title="PRICE HISTORY" />
      </div>

      {/* Key stats */}
      <div style={{ marginBottom: '40px' }}>
        <StockStats stats={stats} />
      </div>

      {/* Rating display */}
      <div style={{ marginBottom: '40px' }}>
        <RatingDisplay
          rating={stock.manualRating}
          notes={stock.notes}
          lastReviewed={lastReviewed}
        />
      </div>

      {/* Signal breakdown stub */}
      <div style={{ marginBottom: '40px' }}>
        <SignalBreakdown ticker={stock.ticker} />
      </div>

      {/* News feed */}
      <div style={{ marginBottom: '40px' }}>
        <NewsFeed articles={mockNews} />
      </div>
    </div>
  )
}
