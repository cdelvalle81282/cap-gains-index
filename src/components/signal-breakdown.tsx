interface SignalBreakdownProps {
  ticker: string
}

export function SignalBreakdown({ ticker }: SignalBreakdownProps) {
  return (
    <div>
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
        SIGNAL ANALYSIS
      </div>

      <div
        style={{
          borderRadius: '10px',
          border: '1px solid var(--dash-border)',
          backgroundColor: 'var(--bg-card)',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}
        >
          Signal analysis for <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{ticker}</span> will
          be available once configured in the admin panel.
        </div>
      </div>
    </div>
  )
}
