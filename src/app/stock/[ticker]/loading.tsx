import { ChartSkeleton } from '@/components/loading-skeleton'

export default function StockLoading() {
  return (
    <div>
      <div className="skeleton" style={{ width: '140px', height: '14px', marginBottom: '24px' }} />
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton" style={{ width: '280px', height: '32px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '100px', height: '14px' }} />
      </div>
      <div style={{ marginBottom: '40px' }}>
        <ChartSkeleton />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--dash-border)', padding: '16px' }}>
            <div className="skeleton" style={{ width: '60%', height: '10px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80%', height: '20px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
