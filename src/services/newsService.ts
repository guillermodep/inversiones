import axios from 'axios'
import { NewsItem } from '@/types'
import { getCache, setCache } from '@/utils/cache'
import { env } from '@/config/env'

const NEWS_API_BASE = 'https://newsapi.org/v2'
const FINNHUB_BASE = 'https://finnhub.io/api/v1'

export async function getMarketNews(): Promise<NewsItem[]> {
  const cacheKey = 'cache_market_news'
  const cached = getCache<NewsItem[]>(cacheKey)
  if (cached) return cached

  try {
    if (env.news.newsApiKey) {
      const response = await axios.get(`${NEWS_API_BASE}/everything`, {
        params: {
          q: 'stock market OR investing OR finance',
          language: 'es',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: env.news.newsApiKey,
        },
      })

      const news: NewsItem[] = response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
      }))

      setCache(cacheKey, news)
      return news
    }

    if (env.news.finnhubKey) {
      const response = await axios.get(`${FINNHUB_BASE}/news`, {
        params: {
          category: 'general',
          token: env.news.finnhubKey,
        },
      })

      const news: NewsItem[] = response.data.slice(0, 20).map((article: any) => ({
        title: article.headline,
        description: article.summary,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.datetime * 1000).toISOString(),
      }))

      setCache(cacheKey, news)
      return news
    }

    return []
  } catch (error) {
    console.error('Error fetching market news:', error)
    return []
  }
}

export async function getStockNews(ticker: string): Promise<NewsItem[]> {
  const cacheKey = `cache_news_${ticker}`
  const cached = getCache<NewsItem[]>(cacheKey)
  if (cached) return cached

  try {
    if (env.news.finnhubKey) {
      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)

      const response = await axios.get(`${FINNHUB_BASE}/company-news`, {
        params: {
          symbol: ticker,
          from: fromDate.toISOString().split('T')[0],
          to: toDate.toISOString().split('T')[0],
          token: env.news.finnhubKey,
        },
      })

      const news: NewsItem[] = response.data.slice(0, 20).map((article: any) => ({
        title: article.headline,
        description: article.summary,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        ticker,
      }))

      setCache(cacheKey, news)
      return news
    }

    if (env.news.newsApiKey) {
      const response = await axios.get(`${NEWS_API_BASE}/everything`, {
        params: {
          q: ticker,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: env.news.newsApiKey,
        },
      })

      const news: NewsItem[] = response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        ticker,
      }))

      setCache(cacheKey, news)
      return news
    }

    return []
  } catch (error) {
    console.error(`Error fetching news for ${ticker}:`, error)
    return []
  }
}
