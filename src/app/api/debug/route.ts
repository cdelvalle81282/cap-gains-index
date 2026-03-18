import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const envInfo = {
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    tursoUrlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 30) || 'NOT SET',
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    tokenPrefix: process.env.TURSO_AUTH_TOKEN?.substring(0, 20) || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  }

  // Test 1: Direct @libsql/client connection
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const result = await client.execute('SELECT COUNT(*) as cnt FROM Sector')
    return NextResponse.json({
      ...envInfo,
      directClientWorks: true,
      sectorCount: result.rows[0]?.cnt,
    })
  } catch (e: unknown) {
    const err = e as Error & { code?: string }
    return NextResponse.json({
      ...envInfo,
      directClientWorks: false,
      directError: err.message,
      directErrorCode: err.code,
      directStack: err.stack?.substring(0, 500),
    }, { status: 500 })
  }
}
