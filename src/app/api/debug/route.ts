import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sectorCount = await prisma.sector.count()
    const stockCount = await prisma.stock.count()
    return NextResponse.json({ ok: true, sectorCount, stockCount })
  } catch (e: unknown) {
    const err = e as Error & { code?: string }
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
