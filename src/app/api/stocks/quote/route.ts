import { NextRequest, NextResponse } from 'next/server'
import { fetchBulkQuotes } from '@/lib/yahoo-finance'

export const revalidate = 300 // ISR: revalidate every 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tickersParam = searchParams.get('tickers')

  if (!tickersParam) {
    return NextResponse.json(
      { error: 'Missing required query parameter: tickers' },
      { status: 400 }
    )
  }

  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0)

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: 'No valid tickers provided' },
      { status: 400 }
    )
  }

  if (tickers.length > 50) {
    return NextResponse.json(
      { error: 'Maximum 50 tickers per request' },
      { status: 400 }
    )
  }

  try {
    const quotes = await fetchBulkQuotes(tickers)
    // Filter out null results but preserve the ticker association
    const validQuotes = quotes.filter((q) => q !== null)

    return NextResponse.json(validQuotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock quotes' },
      { status: 500 }
    )
  }
}
