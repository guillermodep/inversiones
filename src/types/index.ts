export interface StockData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio?: number
  sector?: string
  // Additional Yahoo Finance data
  open?: number
  high?: number
  low?: number
  previousClose?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  avgVolume?: number
  dividendYield?: number
  beta?: number
  eps?: number
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsItem {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  ticker?: string
}

export interface FundamentalData {
  eps?: number
  revenue?: number
  debtToEquity?: number
  freeCashFlow?: number
  dividendYield?: number
  earningsDate?: string
}

export interface LLMRecommendation {
  recommendation: 'COMPRAR' | 'MANTENER' | 'VENDER'
  confidence: 'Alta' | 'Media' | 'Baja'
  targetPrice30Days?: number
  targetPrice90Days?: number
  reasons: string[]
  risks: string[]
  horizon: string
  analysis: string
}

export interface PortfolioPosition {
  ticker: string
  shares: number
  purchasePrice: number
  purchaseDate: string
  currentPrice?: number
}

export interface Portfolio {
  id: string
  name: string
  type: 'short-term' | 'long-term' | 'liquidity' | 'aggressive' | 'conservative'
  positions: PortfolioPosition[]
  createdAt: string
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'custom'

export interface ScreenerFilters {
  sector?: string
  minMarketCap?: number
  maxMarketCap?: number
  minPE?: number
  maxPE?: number
  minDividendYield?: number
  maxRSI?: number
  minRSI?: number
}
