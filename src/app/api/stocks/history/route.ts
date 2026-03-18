import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalData } from '@/lib/yahoo-finance'

export const revalidate = 3600 // ISR: revalidate every 1 hour

const VALID_RANGES = [
  '1d',
  '5d',
  '1mo',
  '3mo',
  '6mo',
  '1y',
  '2y',
  '5y',
  '10y',
  'ytd',
  'max',
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ticker = searchParams.get('ticker')
  const range = searchParams.get('range') ?? '6mo'

  if (!ticker) {
    return NextResponse.json(
      { error: 'Missing required query parameter: ticker' },
      { status: 400 }
    )
  }

  if (!VALID_RANGES.includes(range)) {
    return NextResponse.json(
      {
        error: `Invalid range: ${range}. Valid ranges: ${VALID_RANGES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  try {
    const data = await fetchHistoricalData(ticker.trim().toUpperCase(), range)
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching history for ${ticker}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch historical data for ${ticker}` },
      { status: 500 }
    )
  }
}
