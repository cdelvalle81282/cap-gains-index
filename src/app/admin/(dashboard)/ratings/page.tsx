import { prisma } from '@/lib/db'
import { RatingEditor } from '@/components/admin/rating-editor'

export const dynamic = 'force-dynamic'

export default async function RatingsPage() {
  const sectors = await prisma.sector.findMany({
    include: {
      stocks: {
        select: {
          id: true,
          ticker: true,
          name: true,
          manualRating: true,
          notes: true,
          lastReviewedAt: true,
        },
        orderBy: { ticker: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Serialize dates for client component
  const serialized = sectors.map(sector => ({
    ...sector,
    stocks: sector.stocks.map(stock => ({
      ...stock,
      lastReviewedAt: stock.lastReviewedAt?.toISOString() || null,
    })),
  }))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Rating Manager
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Manage buy/hold/sell/short ratings and notes for all stocks.
        </p>
      </div>

      <RatingEditor initialData={serialized} />
    </div>
  )
}
