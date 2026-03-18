import { NextResponse } from 'next/server'
import { createClient as createWebClient } from '@libsql/client/web'
import { createClient as createNodeClient } from '@libsql/client'
import { encodeBaseUrl, parseUri } from '@libsql/core/uri'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const authToken = process.env.TURSO_AUTH_TOKEN || ''
  const results: Record<string, unknown> = { nodeVersion: process.version }

  // Test 1: Parse the URL manually
  try {
    const uri = parseUri(tursoUrl)
    results.parsedScheme = uri.scheme
    results.parsedHost = uri.authority?.host
    results.parsedPath = JSON.stringify(uri.path)

    // Try encodeBaseUrl manually
    const encoded = encodeBaseUrl(uri.scheme, uri.authority!, uri.path)
    results.encodedUrl = encoded.toString()
  } catch (e: unknown) {
    results.parseError = (e as Error).message
    results.parseStack = (e as Error).stack?.substring(0, 300)
  }

  // Test 2: Web client
  try {
    const client = createWebClient({ url: tursoUrl, authToken })
    const r = await client.execute('SELECT COUNT(*) as cnt FROM Sector')
    results.webClientWorks = true
    results.webCount = r.rows[0]?.cnt
  } catch (e: unknown) {
    results.webClientWorks = false
    results.webError = (e as Error).message
  }

  // Test 3: Node client
  try {
    const client = createNodeClient({ url: tursoUrl, authToken })
    const r = await client.execute('SELECT COUNT(*) as cnt FROM Sector')
    results.nodeClientWorks = true
    results.nodeCount = r.rows[0]?.cnt
  } catch (e: unknown) {
    results.nodeClientWorks = false
    results.nodeError = (e as Error).message
  }

  return NextResponse.json(results, { status: results.webClientWorks || results.nodeClientWorks ? 200 : 500 })
}
