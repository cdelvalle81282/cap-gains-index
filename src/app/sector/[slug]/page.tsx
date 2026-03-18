import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SECTOR_COLORS } from '@/lib/theme-config'
import { IndexChart } from '@/components/index-chart'
import { StockTable } from '@/components/stock-table'
import type { StockTableRow } from '@/components/stock-table'
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

function generateMockHistoricalIndex(seed: string): { date: string; value: number }[] {
  const rng = seededRandom(seed)
  const points: { date: string; value: number }[] = []
  let value = 100
  const trend = (rng() - 0.4) * 0.3

  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 2)

  for (let i = 0; i < 500; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    value += trend + (rng() - 0.5) * 2
    value = Math.max(50, value)
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    })
  }
  return points
}

function generateMockStockData(stocks: { ticker: string; name: string; manualRating: string }[], sectorSlug: string): StockTableRow[] {
  const rng = seededRandom(sectorSlug + '-stocks')
  const signalLabels = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell']

  return stocks.map((stock) => {
    const price = 20 + rng() * 480
    const changePercent = (rng() - 0.5) * 10
    const change = price * changePercent / 100
    const marketCap = (rng() * 500 + 1) * 1e9
    const signalLabel = signalLabels[Math.floor(rng() * signalLabels.length)]

    return {
      ticker: stock.ticker,
      name: stock.name,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      marketCap,
      weight: 0, // will be calculated below
      rating: stock.manualRating,
      signalLabel,
    }
  })
}

export async function generateStaticParams() {
  try {
    const sectors = await prisma.sector.findMany({ select: { slug: true } })
    return sectors.map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const sector = await prisma.sector.findUnique({
    where: { slug },
    include: {
      stocks: {
        select: { ticker: true, name: true, manualRating: true },
        orderBy: { ticker: 'asc' },
      },
    },
  })

  if (!sector) {
    notFound()
  }

  const color = SECTOR_COLORS[sector.slug] || '#8b8da3'
  const chartData = generateMockHistoricalIndex(sector.slug)
  const stockData = generateMockStockData(sector.stocks, sector.slug)

  // Calculate weights from mock market caps
  const totalMarketCap = stockData.reduce((sum, s) => sum + s.marketCap, 0)
  for (const stock of stockData) {
    stock.weight = totalMarketCap > 0 ? stock.marketCap / totalMarketCap : 0
  }

  // Mock news for the sector
  const mockNews: NewsArticle[] = [
    {
      title: `${sector.name} sector sees strong institutional interest amid market shifts`,
      link: '#',
      pubDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      source: 'Reuters',
      sector: sector.slug,
      sectorColor: color,
    },
    {
      title: `Analysts upgrade outlook for key ${sector.name.toLowerCase()} companies`,
      link: '#',
      pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: 'Bloomberg',
      sector: sector.slug,
      sectorColor: color,
    },
  ]

  return (
    <div>
      {/* Back link */}
      <Link
        href="/"
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
        &larr; Back to Overview
      </Link>

      {/* Sector header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {sector.name}
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {sector.stocks.length} stocks &middot; Market-cap weighted index
        </div>
      </div>

      {/* Index chart */}
      <div style={{ marginBottom: '40px' }}>
        <IndexChart data={chartData} color={color} title="INDEX PERFORMANCE" />
      </div>

      {/* Stock table */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
          HOLDINGS
        </div>
        <StockTable stocks={stockData} sectorSlug={sector.slug} />
      </div>

      {/* Sector news */}
      <div style={{ marginBottom: '40px' }}>
        <NewsFeed articles={mockNews} />
      </div>
    </div>
  )
}
