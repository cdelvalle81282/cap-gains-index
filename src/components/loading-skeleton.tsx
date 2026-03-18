export function SectorCardSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '10px',
      border: '1px solid var(--dash-border)',
      padding: '20px',
      height: '200px',
    }}>
      <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '12px' }} />
      <div className="skeleton" style={{ width: '30%', height: '24px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '50px', marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '6px' }}>
        <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '10px',
      border: '1px solid var(--dash-border)',
      padding: '20px',
      height: '400px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="skeleton" style={{ width: '120px', height: '12px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '180px', height: '28px' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ width: '36px', height: '28px', borderRadius: '6px' }} />
          ))}
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: '280px', borderRadius: '8px' }} />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div style={{ borderRadius: '10px', border: '1px solid var(--dash-border)', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '16px', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--dash-border)' }}>
        {[60, 120, 80, 80, 100, 80, 60].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}px`, height: '12px' }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px', borderBottom: i < rows - 1 ? '1px solid var(--dash-border)' : 'none' }}>
          {[60, 120, 80, 80, 100, 80, 60].map((w, j) => (
            <div key={j} className="skeleton" style={{ width: `${w}px`, height: '14px' }} />
          ))}
        </div>
      ))}
    </div>
  )
}
