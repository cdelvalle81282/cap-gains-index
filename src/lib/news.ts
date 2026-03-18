import Parser from 'rss-parser'

export interface NewsArticle {
  title: string
  link: string
  pubDate: string
  source: string
  snippet: string
}

const parser = new Parser()

export async function fetchNewsForQuery(query: string, limit = 5): Promise<NewsArticle[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
    const feed = await parser.parseURL(url)
    return feed.items.slice(0, limit).map(item => ({
      title: item.title ?? '',
      link: item.link ?? '',
      pubDate: item.pubDate ?? '',
      source: extractSource(item.title ?? ''),
      snippet: item.contentSnippet ?? '',
    }))
  } catch (error) {
    console.error(`Failed to fetch news for query "${query}":`, error)
    return []
  }
}

function extractSource(title: string): string {
  const match = title.match(/ - ([^-]+)$/)
  return match ? match[1].trim() : 'Unknown'
}

export async function fetchSectorNews(sectorName: string, tickers: string[]): Promise<NewsArticle[]> {
  const query = `${sectorName} stocks ${tickers.slice(0, 5).join(' OR ')}`
  return fetchNewsForQuery(query, 8)
}

export async function fetchStockNews(ticker: string, companyName: string): Promise<NewsArticle[]> {
  return fetchNewsForQuery(`${companyName} ${ticker} stock`, 5)
}
