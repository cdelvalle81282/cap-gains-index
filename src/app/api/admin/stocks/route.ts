import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Return all stocks grouped by sector
export async function GET() {
  const sectors = await prisma.sector.findMany({
    include: {
      stocks: {
        select: { id: true, ticker: true, name: true, manualRating: true },
        orderBy: { ticker: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(sectors)
}

// POST: Add new stock
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { ticker, name, sectorSlug } = body

  if (!ticker || !name || !sectorSlug) {
    return NextResponse.json({ error: 'ticker, name, and sectorSlug required' }, { status: 400 })
  }

  const sector = await prisma.sector.findUnique({ where: { slug: sectorSlug } })
  if (!sector) {
    return NextResponse.json({ error: 'Sector not found' }, { status: 404 })
  }

  // Check for duplicate ticker
  const existing = await prisma.stock.findUnique({ where: { ticker: ticker.toUpperCase() } })
  if (existing) {
    return NextResponse.json({ error: 'Ticker already exists' }, { status: 409 })
  }

  const stock = await prisma.stock.create({
    data: {
      ticker: ticker.toUpperCase(),
      name,
      sectorId: sector.id,
    },
  })

  return NextResponse.json(stock, { status: 201 })
}

// PUT: Move stock to different sector
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { ticker, newSectorSlug } = body

  if (!ticker || !newSectorSlug) {
    return NextResponse.json({ error: 'ticker and newSectorSlug required' }, { status: 400 })
  }

  const sector = await prisma.sector.findUnique({ where: { slug: newSectorSlug } })
  if (!sector) {
    return NextResponse.json({ error: 'Sector not found' }, { status: 404 })
  }

  const stock = await prisma.stock.update({
    where: { ticker: ticker.toUpperCase() },
    data: { sectorId: sector.id },
  })

  return NextResponse.json(stock)
}

// DELETE: Remove stock
export async function DELETE(request: NextRequest) {
  const { ticker } = await request.json()

  if (!ticker) {
    return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  }

  await prisma.stock.delete({ where: { ticker: ticker.toUpperCase() } })

  return NextResponse.json({ success: true })
}
