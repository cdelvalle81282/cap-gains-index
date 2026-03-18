'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

function formatDate(): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Header() {
  return (
    <header
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--dash-border)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* Left side: Logo + Portfolio badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Logo */}
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #00d4aa, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CAP GAINS INDEX
        </span>

        {/* Portfolio daily change badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#00d4aa',
            backgroundColor: 'rgba(0,212,170,0.12)',
            border: '1px solid rgba(0,212,170,0.2)',
          }}
        >
          &#9650; +1.84% today
        </span>
      </div>

      {/* Right side: Date + Theme toggle + Admin link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Date display */}
        <span
          style={{
            fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          {formatDate()}
        </span>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Admin link */}
        <Link
          href="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '36px',
            padding: '0 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--dash-border)',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--dash-border-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--dash-border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          Admin
        </Link>
      </div>
    </header>
  )
}
