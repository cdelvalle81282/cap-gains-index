'use client'

interface TimeRangeSelectorProps {
  selected: string
  onChange: (range: string) => void
}

const ranges = ['1M', '3M', '6M', '1Y', '2Y']

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            borderRadius: '6px',
            border: '1px solid var(--dash-border)',
            backgroundColor: selected === range ? '#4d7cff' : 'transparent',
            color: selected === range ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
