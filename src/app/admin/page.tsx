'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin/ratings')
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--dash-border)',
          borderRadius: '12px',
          padding: '40px 32px',
        }}
      >
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          Admin Access
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          Enter your password to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--dash-border)',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4d7cff'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(77,124,255,0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--dash-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: '13px',
                color: '#ff4d6a',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#4d7cff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 150ms ease, background-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#3d6ae8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4d7cff'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
