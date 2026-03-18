import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Return all stocks with ratings, grouped by sector
export async function GET() {
  const sectors = await prisma.sector.findMany({
    include: {
      stocks: {
        select: {
          id: true,
          ticker: true,
          name: true,
          manualRating: true,
          notes: true,
          lastReviewedAt: true,
        },
        orderBy: { ticker: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(sectors)
}

// PUT: Update a stock's rating and/or notes
export async function PUT(request: Request) {
  const body = await request.json()
  const { ticker, rating, notes } = body

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    lastReviewedAt: new Date(),
  }

  if (rating !== undefined) {
    const validRatings = ['buy', 'hold', 'sell', 'short']
    if (!validRatings.includes(rating.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }
    updateData.manualRating = rating.toLowerCase()
  }

  if (notes !== undefined) {
    updateData.notes = notes
  }

  const stock = await prisma.stock.update({
    where: { ticker },
    data: updateData,
  })

  return NextResponse.json(stock)
}
