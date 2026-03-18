import { NextRequest, NextResponse } from 'next/server'
import { fetchSectorNews, fetchStockNews, fetchNewsForQuery } from '@/lib/news'

export const revalidate = 1800 // 30 min ISR cache

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sector = searchParams.get('sector')
  const ticker = searchParams.get('ticker')
  const name = searchParams.get('name')

  try {
    let articles

    if (sector) {
      // Fetch news for a sector
      // We'd need tickers but for the API, we'll use the sector name
      articles = await fetchNewsForQuery(`${sector} stocks market`, 8)
    } else if (ticker && name) {
      // Fetch news for a specific stock
      articles = await fetchStockNews(ticker, name)
    } else {
      // Fetch general market news
      articles = await fetchNewsForQuery('stock market today', 10)
    }

    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
