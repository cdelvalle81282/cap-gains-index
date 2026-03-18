'use client'

import Link from 'next/link'
import { Sparkline } from '@/components/sparkline'
import { RatingPills } from '@/components/rating-pills'

interface SectorCardProps {
  sector: {
    name: string
    slug: string
    stockCount: number
    dailyChange: number
    sparklineData: number[]
    ratingCounts: {
      buy: number
      hold: number
      sell: number
      short: number
    }
    color: string
  }
}

export function SectorCard({ sector }: SectorCardProps) {
  const isPositive = sector.dailyChange >= 0
  const changeColor = isPositive ? 'var(--green)' : 'var(--red)'
  const changeSign = isPositive ? '+' : ''
  const accentGradient = isPositive
    ? 'linear-gradient(90deg, #00d4aa, #06b6d4)'
    : 'linear-gradient(90deg, #ff4d6a, #f59e0b)'

  return (
    <Link
      href={`/sector/${sector.slug}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--dash-border)',
          borderRadius: '12px',
          padding: '20px',
          overflow: 'hidden',
          transition: 'all 200ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'var(--dash-border-hover)'
          el.style.backgroundColor = 'var(--bg-card-hover)'
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'var(--dash-border)'
          el.style.backgroundColor = 'var(--bg-card)'
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: accentGradient,
          }}
        />

        {/* Header row: sector name + stock count */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {sector.name}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
              color: 'var(--text-muted)',
            }}
          >
            {sector.stockCount} stocks
          </span>
        </div>

        {/* Daily change percentage */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
            color: changeColor,
            marginBottom: '12px',
          }}
        >
          {changeSign}{sector.dailyChange.toFixed(2)}%
        </div>

        {/* Sparkline */}
        <div style={{ height: '50px', marginBottom: '12px' }}>
          <Sparkline data={sector.sparklineData} color={sector.color} />
        </div>

        {/* Rating pills */}
        <RatingPills ratings={sector.ratingCounts} />
      </div>
    </Link>
  )
}
