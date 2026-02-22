import axios from 'axios'
import { StockData, HistoricalData, FundamentalData } from '@/types'
import { getCache, setCache } from '@/utils/cache'
import { env } from '@/config/env'

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query'
const FMP_BASE = 'https://financialmodelingprep.com/api/v3'

// Mock stock data for popular stocks (CORS prevents direct API calls from browser)
const mockStockData: Record<string, { name: string; basePrice: number; marketCap: number }> = {
  'AAPL': { name: 'Apple Inc.', basePrice: 178.50, marketCap: 2800000000000 },
  'MSFT': { name: 'Microsoft Corporation', basePrice: 415.20, marketCap: 3100000000000 },
  'GOOGL': { name: 'Alphabet Inc.', basePrice: 142.80, marketCap: 1800000000000 },
  'AMZN': { name: 'Amazon.com Inc.', basePrice: 175.30, marketCap: 1820000000000 },
  'TSLA': { name: 'Tesla Inc.', basePrice: 242.50, marketCap: 770000000000 },
  'META': { name: 'Meta Platforms Inc.', basePrice: 485.60, marketCap: 1240000000000 },
  'NVDA': { name: 'NVIDIA Corporation', basePrice: 875.40, marketCap: 2160000000000 },
  'JPM': { name: 'JPMorgan Chase & Co.', basePrice: 198.70, marketCap: 580000000000 },
}

function generateMockQuote(ticker: string): StockData {
  const mock = mockStockData[ticker] || { name: ticker, basePrice: 100, marketCap: 1000000000 }
  
  // Generate realistic price variation (-3% to +3%)
  const variation = (Math.random() - 0.5) * 0.06
  const currentPrice = mock.basePrice * (1 + variation)
  const change = currentPrice - mock.basePrice
  const changePercent = (change / mock.basePrice) * 100
  
  return {
    ticker,
    name: mock.name,
    price: parseFloat(currentPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 10000000,
    marketCap: mock.marketCap,
  }
}

export async function getStockQuote(ticker: string): Promise<StockData | null> {
  const cacheKey = `cache_quote_${ticker}`
  const cached = getCache<StockData>(cacheKey)
  if (cached) return cached

  // Try Alpha Vantage first (works in production)
  if (env.marketData.alphaVantageKey) {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: ticker,
          apikey: env.marketData.alphaVantageKey,
        },
        timeout: 10000,
      })

      const quote = response.data['Global Quote']
      if (quote && quote['01. symbol']) {
        const currentPrice = parseFloat(quote['05. price'])
        const change = parseFloat(quote['09. change'])
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
        const previousClose = currentPrice - change

        const data: StockData = {
          ticker: quote['01. symbol'],
          name: ticker, // Alpha Vantage doesn't provide company name in GLOBAL_QUOTE
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: parseInt(quote['06. volume']),
          marketCap: 0, // Not available in GLOBAL_QUOTE
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          previousClose: previousClose,
        }

        setCache(cacheKey, data)
        return data
      }
    } catch (error: any) {
      console.warn(`Alpha Vantage failed for ${ticker}:`, error.message)
    }
  }

  // Fallback to Yahoo Finance proxy (works in development)
  try {
    const response = await axios.get(`/api/yahoo/v8/finance/chart/${ticker}`, {
      params: {
        interval: '1d',
        range: '1d',
      },
      timeout: 5000,
    })

    const result = response.data?.chart?.result?.[0]
    
    if (!result) {
      throw new Error('No result from Yahoo Finance')
    }

    const meta = result.meta
    const quote = result.indicators?.quote?.[0]
    
    if (!meta || !quote) {
      throw new Error('Missing meta or quote data')
    }

    const currentPrice = meta.regularMarketPrice || quote.close?.[quote.close.length - 1] || 0
    const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    // Get today's OHLC from quote data
    const lastIndex = quote.close?.length - 1 || 0
    const todayOpen = quote.open?.[lastIndex] || meta.regularMarketOpen || currentPrice
    const todayHigh = quote.high?.[lastIndex] || meta.regularMarketDayHigh || currentPrice
    const todayLow = quote.low?.[lastIndex] || meta.regularMarketDayLow || currentPrice

    const data: StockData = {
      ticker: meta.symbol,
      name: meta.longName || meta.shortName || ticker,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap,
      // Additional data
      open: todayOpen,
      high: todayHigh,
      low: todayLow,
      previousClose: previousClose,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      avgVolume: meta.averageDailyVolume10Day || meta.averageDailyVolume3Month,
      peRatio: meta.trailingPE,
      dividendYield: meta.dividendYield ? meta.dividendYield * 100 : undefined,
      beta: meta.beta,
      eps: meta.epsTrailingTwelveMonths,
    }

    setCache(cacheKey, data)
    return data
  } catch (error: any) {
    console.error(`All data sources failed for ${ticker}:`, error.message)
    // Last resort: use mock data
    console.warn(`⚠️ Using mock data for ${ticker} as all APIs failed`)
    const data = generateMockQuote(ticker)
    setCache(cacheKey, data)
    return data
  }
}

function generateSampleData(range: string, basePrice: number = 150): HistoricalData[] {
  const now = new Date()
  let days = 90
  
  switch (range) {
    case '1D':
      days = 1
      break
    case '1W':
      days = 7
      break
    case '1M':
      days = 30
      break
    case '3M':
      days = 90
      break
    case '6M':
      days = 180
      break
    case 'YTD':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      days = Math.floor((now.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000))
      break
    case '1Y':
      days = 365
      break
    case '2Y':
      days = 730
      break
    case '5Y':
      days = 1825
      break
    case '10Y':
      days = 3650
      break
    case 'ALL':
      days = 3650 // 10 years for ALL
      break
  }
  
  const data: HistoricalData[] = []
  let currentPrice = basePrice
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const randomChange = (Math.random() - 0.5) * (basePrice * 0.02)
    currentPrice = Math.max(currentPrice + randomChange, basePrice * 0.8)
    
    const open = currentPrice
    const close = currentPrice + (Math.random() - 0.5) * (basePrice * 0.01)
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.005)
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.005)
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000) + 5000000,
    })
    
    currentPrice = close
  }
  
  return data
}

export async function getHistoricalData(
  ticker: string,
  range: string = '1M'
): Promise<HistoricalData[]> {
  // Try Alpha Vantage first (works in production)
  if (env.marketData.alphaVantageKey) {
    try {
      const outputsize = ['1Y', '2Y', '5Y', '10Y', 'ALL'].includes(range) ? 'full' : 'compact'
      const response = await axios.get(ALPHA_VANTAGE_BASE, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: ticker,
          apikey: env.marketData.alphaVantageKey,
          outputsize,
        },
        timeout: 15000,
      })

      const timeSeries = response.data['Time Series (Daily)']
      if (timeSeries) {
        let allData: HistoricalData[] = Object.entries(timeSeries)
          .map(([date, values]: [string, any]) => ({
            date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume']),
          }))
          .reverse()

        // Filter by range
        const now = new Date()
        let daysToInclude = 90
        
        switch (range) {
          case '1D': daysToInclude = 1; break
          case '1W': daysToInclude = 7; break
          case '1M': daysToInclude = 30; break
          case '3M': daysToInclude = 90; break
          case '6M': daysToInclude = 180; break
          case 'YTD':
            const yearStart = new Date(now.getFullYear(), 0, 1)
            daysToInclude = Math.floor((now.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000))
            break
          case '1Y': daysToInclude = 365; break
          case '2Y': daysToInclude = 730; break
          case '5Y': daysToInclude = 1825; break
          case '10Y': daysToInclude = 3650; break
          case 'ALL': return allData
        }
        
        const cutoffDate = new Date(now.getTime() - daysToInclude * 24 * 60 * 60 * 1000)
        const filtered = allData.filter(item => new Date(item.date) >= cutoffDate)
        
        console.log(`📈 Got ${filtered.length} historical data points from Alpha Vantage for ${ticker} (${range})`)
        return filtered
      }
    } catch (error: any) {
      console.warn(`Alpha Vantage historical data failed for ${ticker}:`, error.message)
    }
  }

  // Fallback to Yahoo Finance proxy
  try {
    const now = Math.floor(Date.now() / 1000)
    let period1: number
    let interval = '1d'
    
    switch (range) {
      case '1D': period1 = now - (2 * 24 * 60 * 60); interval = '5m'; break
      case '1W': period1 = now - (7 * 24 * 60 * 60); interval = '1h'; break
      case '1M': period1 = now - (30 * 24 * 60 * 60); break
      case '3M': period1 = now - (90 * 24 * 60 * 60); break
      case '6M': period1 = now - (180 * 24 * 60 * 60); break
      case 'YTD':
        const yearStart = new Date(now * 1000)
        yearStart.setMonth(0, 1)
        yearStart.setHours(0, 0, 0, 0)
        period1 = Math.floor(yearStart.getTime() / 1000)
        break
      case '1Y': period1 = now - (365 * 24 * 60 * 60); break
      case '2Y': period1 = now - (730 * 24 * 60 * 60); break
      case '5Y': period1 = now - (1825 * 24 * 60 * 60); break
      case '10Y': period1 = now - (3650 * 24 * 60 * 60); break
      case 'ALL': period1 = now - (7300 * 24 * 60 * 60); break
      default: period1 = now - (90 * 24 * 60 * 60)
    }

    const response = await axios.get(`/api/yahoo/v8/finance/chart/${ticker}`, {
      params: { period1, period2: now, interval },
      timeout: 10000,
    })

    const result = response.data?.chart?.result?.[0]
    if (result && result.timestamp && result.indicators?.quote?.[0]) {
      const timestamps = result.timestamp
      const quote = result.indicators.quote[0]
      
      const data: HistoricalData[] = timestamps
        .map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          open: quote.open?.[index] || 0,
          high: quote.high?.[index] || 0,
          low: quote.low?.[index] || 0,
          close: quote.close?.[index] || 0,
          volume: quote.volume?.[index] || 0,
        }))
        .filter((item: HistoricalData) => item.close > 0)

      console.log(`📈 Got ${data.length} historical data points from Yahoo Finance for ${ticker} (${range})`)
      return data
    }
  } catch (error: any) {
    console.warn(`Yahoo Finance historical data failed for ${ticker}:`, error.message)
  }

  // Last resort: generate sample data
  console.error(`All historical data sources failed for ${ticker}, using generated data`)
  const quote = await getStockQuote(ticker)
  return generateSampleData(range, quote?.price || 150)
}

export async function getFundamentals(ticker: string): Promise<FundamentalData | null> {
  const cacheKey = `cache_fundamentals_${ticker}`
  const cached = getCache<FundamentalData>(cacheKey)
  if (cached) return cached

  try {
    const response = await axios.get(`${FMP_BASE}/profile/${ticker}`, {
      params: { apikey: env.marketData.fmpKey || 'demo' },
    })

    if (response.data && response.data.length > 0) {
      const profile = response.data[0]
      const data: FundamentalData = {
        eps: profile.eps,
        revenue: profile.revenue,
        debtToEquity: profile.debtToEquity,
        freeCashFlow: profile.freeCashFlow,
        dividendYield: profile.dividendYield,
      }

      setCache(cacheKey, data)
      return data
    }

    return null
  } catch (error) {
    console.error(`Error fetching fundamentals for ${ticker}:`, error)
    return null
  }
}

export async function getMarketIndices(): Promise<StockData[]> {
  const indices = ['^GSPC', '^IXIC', '^DJI', '^VIX']
  const results = await Promise.all(
    indices.map(ticker => getStockQuote(ticker))
  )
  return results.filter((data): data is StockData => data !== null)
}

export async function searchStocks(query: string): Promise<StockData[]> {
  try {
    if (env.marketData.alphaVantageKey) {
      const response = await axios.get(ALPHA_VANTAGE_BASE, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: env.marketData.alphaVantageKey,
        },
      })

      const matches = response.data.bestMatches || []
      return matches.slice(0, 10).map((match: any) => ({
        ticker: match['1. symbol'],
        name: match['2. name'],
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
      }))
    }

    const response = await axios.get(`${FMP_BASE}/search`, {
      params: {
        query,
        limit: 10,
        apikey: env.marketData.fmpKey || 'demo',
      },
    })

    return response.data.map((item: any) => ({
      ticker: item.symbol,
      name: item.name,
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
    }))
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}
