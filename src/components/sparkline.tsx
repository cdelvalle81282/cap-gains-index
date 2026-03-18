'use client'

interface SparklineProps {
  data: number[]
  color: string
  className?: string
}

export function Sparkline({ data, color, className }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const viewBoxWidth = 200
  const viewBoxHeight = 50

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * viewBoxWidth
    const y = viewBoxHeight - ((value - min) / range) * viewBoxHeight
    return `${x},${y}`
  })

  const polylinePoints = points.join(' ')

  // Build the area fill path: start at bottom-left, trace the line, then close at bottom-right
  const firstX = 0
  const lastX = viewBoxWidth
  const areaPath = `M ${firstX},${viewBoxHeight} L ${points.map(p => p.replace(',', ' ')).join(' L ')} L ${lastX},${viewBoxHeight} Z`

  const gradientId = `sparkline-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
