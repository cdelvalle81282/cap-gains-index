import { prisma } from '@/lib/db'
import { SECTOR_COLORS } from '@/lib/theme-config'
import { SectorCard } from '@/components/sector-card'
import { NewsFeed } from '@/components/news-feed'
import type { NewsArticle } from '@/components/news-item'

export const revalidate = 300

// Seeded random number generator for deterministic mock data per sector
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  let state = hash
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function generateMockSparklineData(seed: string): number[] {
  const rng = seededRandom(seed)
  const points: number[] = []
  let value = 100 + (rng() - 0.5) * 20

  // Decide overall trend direction
  const trend = (rng() - 0.5) * 0.8

  for (let i = 0; i < 30; i++) {
    value += trend + (rng() - 0.5) * 3
    points.push(Math.max(0, value))
  }
  return points
}

function generateMockDailyChange(seed: string): number {
  const rng = seededRandom(seed + '-change')
  return (rng() - 0.5) * 10 // Between -5% and +5%
}

export default async function Home() {
  const sectors = await prisma.sector.findMany({
    include: {
      stocks: {
        select: {
          manualRating: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const sectorCards = sectors.map((sector) => {
    // Count ratings
    const ratingCounts = { buy: 0, hold: 0, sell: 0, short: 0 }
    for (const stock of sector.stocks) {
      const rating = stock.manualRating.toLowerCase() as keyof typeof ratingCounts
      if (rating in ratingCounts) {
        ratingCounts[rating]++
      }
    }

    const color = SECTOR_COLORS[sector.slug] || '#8b8da3'

    return {
      name: sector.name,
      slug: sector.slug,
      stockCount: sector.stocks.length,
      dailyChange: generateMockDailyChange(sector.slug),
      sparklineData: generateMockSparklineData(sector.slug),
      ratingCounts,
      color,
    }
  })

  // Mock news articles
  const mockNewsArticles: NewsArticle[] = [
    {
      title: 'RTX Corporation secures $2.4B Pentagon contract for next-gen missile defense systems',
      link: 'https://example.com/rtx-contract',
      pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Defense News',
      sector: 'defense',
      sectorColor: '#4d7cff',
    },
    {
      title: 'Bitcoin surges past $108K as institutional inflows hit record weekly volume',
      link: 'https://example.com/bitcoin-surge',
      pubDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      source: 'CoinDesk',
      sector: 'crypto',
      sectorColor: '#a855f7',
    },
    {
      title: 'NVIDIA unveils Blackwell Ultra GPUs with 2x inference performance for enterprise AI',
      link: 'https://example.com/nvidia-blackwell',
      pubDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      source: 'TechCrunch',
      sector: 'ai-semi',
      sectorColor: '#06b6d4',
    },
    {
      title: 'ExxonMobil expands Permian Basin operations with $6.1B acquisition of Pioneer assets',
      link: 'https://example.com/exxon-permian',
      pubDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      source: 'Reuters',
      sector: 'energy',
      sectorColor: '#f59e0b',
    },
    {
      title: 'Gold prices climb to $2,850/oz as central banks accelerate reserve diversification',
      link: 'https://example.com/gold-prices',
      pubDate: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      source: 'Bloomberg',
      sector: 'commodities',
      sectorColor: '#00d4aa',
    },
    {
      title: 'AeroVironment wins $95M Army contract for Switchblade 600 loitering munition drones',
      link: 'https://example.com/aerovironment-drones',
      pubDate: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
      source: 'Defense One',
      sector: 'defense',
      sectorColor: '#4d7cff',
    },
  ]

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
        SECTOR PERFORMANCE
      </div>

      {/* Sector cards grid */}
      <div className="sector-grid">
        {sectorCards.map((sector) => (
          <SectorCard key={sector.slug} sector={sector} />
        ))}
      </div>

      {/* News feed section */}
      <div style={{ marginTop: '40px' }}>
        <NewsFeed articles={mockNewsArticles} />
      </div>
    </div>
  )
}
