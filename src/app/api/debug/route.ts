import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const envInfo = {
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    tursoUrlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 15) || 'NOT SET',
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 15) || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  }

  try {
    const count = await prisma.sector.count()
    return NextResponse.json({ ...envInfo, dbConnected: true, sectorCount: count })
  } catch (e: unknown) {
    const err = e as Error & { code?: string; meta?: unknown }
    return NextResponse.json({
      ...envInfo,
      dbConnected: false,
      error: err.message,
      errorCode: err.code,
      errorMeta: err.meta,
    }, { status: 500 })
  }
}
