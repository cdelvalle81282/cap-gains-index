import { prisma } from '@/lib/db'
import { SECTOR_COLORS } from '@/lib/theme-config'
import { SectorCard } from '@/components/sector-card'

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {sectorCards.map((sector) => (
          <SectorCard key={sector.slug} sector={sector} />
        ))}
      </div>
    </div>
  )
}
