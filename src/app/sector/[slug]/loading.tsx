import { ChartSkeleton } from '@/components/loading-skeleton'
import { TableSkeleton } from '@/components/loading-skeleton'

export default function SectorLoading() {
  return (
    <div>
      <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '24px' }} />
      <div>
        <div className="skeleton" style={{ width: '250px', height: '28px', marginBottom: '4px' }} />
        <div className="skeleton" style={{ width: '180px', height: '14px', marginBottom: '32px' }} />
      </div>
      <div style={{ marginBottom: '40px' }}>
        <ChartSkeleton />
      </div>
      <div style={{ marginBottom: '40px' }}>
        <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '16px' }} />
        <TableSkeleton />
      </div>
    </div>
  )
}
