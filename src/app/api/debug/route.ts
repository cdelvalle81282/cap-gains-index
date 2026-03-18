import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''

  // Test 1: Can Node.js parse the URL?
  let urlParseResult: string
  try {
    const parsed = new URL(tursoUrl)
    urlParseResult = `OK: ${parsed.protocol}//${parsed.hostname}`
  } catch (e: unknown) {
    urlParseResult = `FAIL: ${(e as Error).message}`
  }

  // Test 2: Node version
  const nodeVersion = process.version

  // Test 3: Direct @libsql/client connection
  try {
    const client = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const result = await client.execute('SELECT COUNT(*) as cnt FROM Sector')
    return NextResponse.json({
      nodeVersion,
      urlParseResult,
      tursoUrl: tursoUrl.substring(0, 40),
      directClientWorks: true,
      sectorCount: result.rows[0]?.cnt,
    })
  } catch (e: unknown) {
    const err = e as Error & { code?: string }
    return NextResponse.json({
      nodeVersion,
      urlParseResult,
      tursoUrl: tursoUrl.substring(0, 40),
      directClientWorks: false,
      error: err.message,
      code: err.code,
      stack: err.stack?.substring(0, 600),
    }, { status: 500 })
  }
}
