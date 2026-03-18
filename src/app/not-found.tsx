import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      textAlign: 'center',
      padding: '40px',
    }}>
      <div style={{ fontSize: '64px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '16px' }}>
        404
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: 600,
          backgroundColor: '#4d7cff',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          transition: 'opacity 150ms ease',
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
