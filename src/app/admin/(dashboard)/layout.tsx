'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navLinks = [
  { href: '/admin/ratings', label: 'Ratings' },
  { href: '/admin/signals', label: 'Signals' },
  { href: '/admin/stocks', label: 'Stocks' },
]

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--dash-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          flexShrink: 0,
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: '0 20px 20px',
            borderBottom: '1px solid var(--dash-border)',
            marginBottom: '16px',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              background: 'linear-gradient(90deg, #00d4aa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
            }}
          >
            CAP GAINS INDEX
          </Link>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            Admin Panel
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  transition: 'all 150ms ease',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout button */}
        <div style={{ padding: '0 12px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#ff4d6a',
              backgroundColor: 'transparent',
              border: '1px solid var(--dash-border)',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,77,106,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--dash-border)'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: '32px',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
