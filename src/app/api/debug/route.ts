import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const authToken = process.env.TURSO_AUTH_TOKEN || ''

  // Test 1: Direct fetch to Turso HTTP API (bypass @libsql/client entirely)
  try {
    const httpUrl = tursoUrl.replace('libsql://', 'https://').replace(/\/$/, '')
    const resp = await fetch(`${httpUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: 'SELECT COUNT(*) as cnt FROM Sector' } },
          { type: 'close' },
        ],
      }),
    })
    const data = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({
        nodeVersion: process.version,
        tursoUrl: httpUrl.substring(0, 40),
        httpStatus: resp.status,
        error: JSON.stringify(data),
      }, { status: 500 })
    }
    // Extract count from Turso response
    const rows = data?.results?.[0]?.response?.result?.rows
    const count = rows?.[0]?.[0]?.value
    return NextResponse.json({
      nodeVersion: process.version,
      tursoUrl: httpUrl.substring(0, 40),
      directFetchWorks: true,
      sectorCount: count,
    })
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({
      nodeVersion: process.version,
      tursoUrl: tursoUrl.substring(0, 40),
      directFetchWorks: false,
      error: err.message,
      stack: err.stack?.substring(0, 500),
    }, { status: 500 })
  }
}
