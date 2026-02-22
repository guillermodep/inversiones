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
  // Disable cache to always get fresh data
  // const cached = getCache<StockData>(cacheKey)
  // if (cached) return cached

  // Try yahoo-finance2 Netlify Function first (works in production)
  try {
    console.log(`🔍 Fetching ${ticker} from yahoo-finance2 (Netlify Function)...`)
    const response = await axios.get(`/.netlify/functions/stock-quote`, {
      params: { ticker },
      timeout: 10000,
    })

    const meta = response.data
    console.log(`📡 Netlify Function response for ${ticker}:`, meta)

    if (meta && meta.symbol) {
      // Use currentPrice from function if available, otherwise regularMarketPrice
      const currentPrice = meta.currentPrice || meta.regularMarketPrice || 0
      const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice
      const change = currentPrice - previousClose
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
      
      console.log(`💰 Price for ${ticker}: ${currentPrice} (change: ${change}, ${changePercent.toFixed(2)}%)`)

      // Log which fields are missing
      const missingFields = []
      if (!meta.marketCap) missingFields.push('marketCap')
      if (!meta.trailingPE) missingFields.push('P/E')
      if (!meta.averageDailyVolume10Day && !meta.averageDailyVolume3Month) missingFields.push('avgVolume')
      if (!meta.dividendYield) missingFields.push('dividendYield')
      if (!meta.beta) missingFields.push('beta')
      if (!meta.epsTrailingTwelveMonths) missingFields.push('EPS')
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ Missing fields for ${ticker}:`, missingFields)
        console.log(`📋 Available meta fields:`, Object.keys(meta))
      }

      const data: StockData = {
        ticker: meta.symbol,
        name: meta.longName || meta.shortName || ticker,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap || 0,
        open: meta.regularMarketOpen || currentPrice,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        previousClose: previousClose,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        avgVolume: meta.averageDailyVolume10Day || meta.averageDailyVolume3Month,
        peRatio: meta.trailingPE,
        dividendYield: meta.dividendYield ? meta.dividendYield * 100 : undefined,
        beta: meta.beta,
        eps: meta.epsTrailingTwelveMonths,
      }

      console.log(`✅ Netlify Function data for ${ticker}:`, data)
      console.log(`📊 Data completeness: P/E=${!!data.peRatio}, MktCap=${!!data.marketCap}, AvgVol=${!!data.avgVolume}, Yield=${!!data.dividendYield}, Beta=${!!data.beta}, EPS=${!!data.eps}`)
      
      // If fundamental data is missing, try to get it from quoteSummary endpoint
      if (!data.marketCap || !data.peRatio || !data.beta || !data.eps) {
        try {
          console.log(`🔍 Fetching fundamentals for ${ticker} from quoteSummary...`)
          const fundResponse = await axios.get(`/.netlify/functions/stock-fundamentals`, {
            params: { ticker },
            timeout: 5000,
          })
          
          const fundamentals = fundResponse.data
          console.log(`📊 Fundamentals from quoteSummary:`, fundamentals)
          
          // Merge fundamental data
          data.marketCap = data.marketCap || fundamentals.marketCap || 0
          data.peRatio = data.peRatio || fundamentals.peRatio
          data.beta = data.beta || fundamentals.beta
          data.eps = data.eps || fundamentals.eps
          data.dividendYield = data.dividendYield || (fundamentals.dividendYield ? fundamentals.dividendYield * 100 : undefined)
          data.avgVolume = data.avgVolume || fundamentals.avgVolume
          data.fiftyTwoWeekHigh = data.fiftyTwoWeekHigh || fundamentals.fiftyTwoWeekHigh
          data.fiftyTwoWeekLow = data.fiftyTwoWeekLow || fundamentals.fiftyTwoWeekLow
          
          console.log(`✅ Merged data for ${ticker}:`, data)
        } catch (error: any) {
          console.warn(`⚠️ Could not fetch fundamentals for ${ticker}:`, error.message)
        }
      }
      
      setCache(cacheKey, data)
      return data
    }
  } catch (error: any) {
    console.warn(`⚠️ yahoo-finance2 failed for ${ticker}:`, error.message)
  }

  // Fallback to Yahoo Finance proxy (works in development)
  try {
    console.log(`🔍 Trying Yahoo Finance for ${ticker}...`)
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

    console.log(`✅ Using Yahoo Finance data for ${ticker}`)

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
    console.error(`❌ Yahoo Finance also failed for ${ticker}:`, error.message)
  }

  // Last resort: use mock data
  console.error(`🚨 ALL APIs FAILED for ${ticker} - Using mock data`)
  const data = generateMockQuote(ticker)
  setCache(cacheKey, data)
  return data
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
  // Try yahoo-finance2 Netlify Function first
  try {
    console.log(`🔍 Fetching historical data for ${ticker} from yahoo-finance2...`)
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

    const response = await axios.get(`/.netlify/functions/stock-historical`, {
      params: { ticker, period1, period2: now, interval },
      timeout: 15000,
    })

    const result = response.data
    if (result && Array.isArray(result) && result.length > 0) {
      const data: HistoricalData[] = result.map((item: any) => ({
        date: new Date(item.date).toISOString().split('T')[0],
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0,
      }))

      console.log(`📈 Got ${data.length} historical data points from yahoo-finance2 for ${ticker} (${range})`)
      return data
    }
  } catch (error: any) {
    console.warn(`⚠️ yahoo-finance2 historical data failed for ${ticker}:`, error.message)
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
    // Simple approach: try to get quote for the ticker directly
    // This works for exact ticker matches (e.g., "AAPL", "MSFT")
    const upperQuery = query.toUpperCase().trim()
    
    console.log(`🔍 Searching for: ${upperQuery}`)
    
    // Try to get quote directly
    const quote = await getStockQuote(upperQuery)
    if (quote) {
      console.log(`✅ Found stock: ${quote.ticker}`)
      return [quote]
    }
    
    console.warn(`⚠️ No results found for: ${upperQuery}`)
    return []
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}
