import { prisma } from '@/lib/db'
import { StockManager } from '@/components/admin/stock-manager'

export const dynamic = 'force-dynamic'

export default async function StocksPage() {
  const sectors = await prisma.sector.findMany({
    include: {
      stocks: {
        select: { id: true, ticker: true, name: true, manualRating: true },
        orderBy: { ticker: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Stock Manager
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Add, remove, and reassign stocks across sectors.
        </p>
      </div>

      <StockManager initialData={sectors} />
    </div>
  )
}
