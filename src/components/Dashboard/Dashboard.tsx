import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { getMarketIndices, getStockQuote } from '@/services/marketDataService'
import { getMarketNews } from '@/services/newsService'
import { StockData, NewsItem } from '@/types'
import Card from '@/components/ui/Card'
import { SkeletonMetricCard, SkeletonCard } from '@/components/ui/Skeleton'
import FadeIn from '@/components/ui/FadeIn'
import CountUp from '@/components/ui/CountUp'
import MarketHeatmap from '@/components/ui/MarketHeatmap'
import InvestmentQuote from '@/components/ui/InvestmentQuote'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { getCache, setCache } from '@/utils/cache'
import { TrendingUp, TrendingDown, Newspaper, AlertTriangle, Wallet, PieChart, BarChart3, Activity } from 'lucide-react'
import { hasLLMConfig } from '@/config/env'
import { Link, useNavigate } from 'react-router-dom'

interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
}

interface TopMover {
  ticker: string
  name: string
  change: number
  changePercent: number
  price: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { portfolios } = useStore()
  const [indices, setIndices] = useState<StockData[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalCost: 0,
    totalPnL: 0,
    totalPnLPercent: 0
  })
  const [topGainers, setTopGainers] = useState<TopMover[]>([])
  const [topLosers, setTopLosers] = useState<TopMover[]>([])
  const [sectorAllocation, setSectorAllocation] = useState<{[key: string]: number}>({})
  const [heatmapData, setHeatmapData] = useState<Array<TopMover & { category: 'stock' | 'etf' | 'bond' }>>([])
  const [loadingIndices, setLoadingIndices] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingTopMovers, setLoadingTopMovers] = useState(true)
  const [loadingHeatmap, setLoadingHeatmap] = useState(true)

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    
    // Try to load from cache first
    const cachedIndices = getCache<StockData[]>('dashboard_indices')
    const cachedNews = getCache<NewsItem[]>('dashboard_news')
    const cachedTopMovers = getCache<{ gainers: TopMover[], losers: TopMover[] }>('dashboard_top_movers')
    const cachedHeatmap = getCache<Array<TopMover & { category: 'stock' | 'etf' | 'bond' }>>('dashboard_heatmap')
    
    // Load cached data immediately if available
    if (cachedIndices) {
      setIndices(cachedIndices)
      setLoadingIndices(false)
    }
    if (cachedNews) {
      setNews(cachedNews)
      setLoadingNews(false)
    }
    if (cachedTopMovers) {
      setTopGainers(cachedTopMovers.gainers)
      setTopLosers(cachedTopMovers.losers)
      setLoadingTopMovers(false)
    }
    if (cachedHeatmap) {
      setHeatmapData(cachedHeatmap)
      setLoadingHeatmap(false)
    }
    
    // Load all data in parallel, update as each completes
    Promise.all([
      getMarketIndices().then(data => {
        setIndices(data)
        setCache('dashboard_indices', data)
        setLoadingIndices(false)
      }).catch(() => setLoadingIndices(false)),
      
      getMarketNews().then(data => {
        setNews(data)
        setCache('dashboard_news', data)
        setLoadingNews(false)
      }).catch(() => setLoadingNews(false)),
      
      calculatePortfolioMetrics(),
      
      loadTopMovers().then(() => setLoadingTopMovers(false)).catch(() => setLoadingTopMovers(false)),
      
      loadHeatmapData().then(() => setLoadingHeatmap(false)).catch(() => setLoadingHeatmap(false))
    ]).finally(() => setLoading(false))
  }

  async function calculatePortfolioMetrics() {
    if (portfolios.length === 0) return

    let totalValue = 0
    let totalCost = 0
    const sectors: {[key: string]: number} = {}

    for (const portfolio of portfolios) {
      for (const position of portfolio.positions) {
        const cost = position.purchasePrice * position.shares
        totalCost += cost

        try {
          const quote = await getStockQuote(position.ticker)
          if (quote) {
            const currentValue = quote.price * position.shares
            totalValue += currentValue
            
            // Sector allocation (simplified)
            const sector = getSector(position.ticker)
            sectors[sector] = (sectors[sector] || 0) + currentValue
          }
        } catch (error) {
          console.error(`Error loading ${position.ticker}:`, error)
        }
      }
    }

    const totalPnL = totalValue - totalCost
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

    setMetrics({ totalValue, totalCost, totalPnL, totalPnLPercent })
    setSectorAllocation(sectors)
  }

  async function loadTopMovers() {
    const tickers = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'TSLA', 'AMD', 'NFLX', 'AMZN', 'JPM', 'BAC', 'WFC']
    const stocks: TopMover[] = []

    for (const ticker of tickers) {
      try {
        const quote = await getStockQuote(ticker)
        if (quote) {
          stocks.push({
            ticker: quote.ticker,
            name: quote.name,
            change: quote.change,
            changePercent: quote.changePercent,
            price: quote.price
          })
        }
      } catch (error) {
        console.error(`Error loading ${ticker}:`, error)
      }
    }

    const sorted = stocks.sort((a, b) => b.changePercent - a.changePercent)
    const gainers = sorted.slice(0, 5)
    const losers = sorted.slice(-5).reverse()
    
    setTopGainers(gainers)
    setTopLosers(losers)
    
    // Cache top movers
    setCache('dashboard_top_movers', { gainers, losers })
  }

  async function loadHeatmapData() {
    const tickers = [
      // Stocks
      { ticker: 'AAPL', category: 'stock' as const },
      { ticker: 'MSFT', category: 'stock' as const },
      { ticker: 'GOOGL', category: 'stock' as const },
      { ticker: 'META', category: 'stock' as const },
      { ticker: 'NVDA', category: 'stock' as const },
      { ticker: 'TSLA', category: 'stock' as const },
      { ticker: 'AMZN', category: 'stock' as const },
      { ticker: 'JPM', category: 'stock' as const },
      { ticker: 'V', category: 'stock' as const },
      { ticker: 'JNJ', category: 'stock' as const },
      // ETFs
      { ticker: 'SPY', category: 'etf' as const },
      { ticker: 'QQQ', category: 'etf' as const },
      { ticker: 'VOO', category: 'etf' as const },
      { ticker: 'IWM', category: 'etf' as const },
      { ticker: 'VTI', category: 'etf' as const },
      // Bonds
      { ticker: 'TLT', category: 'bond' as const },
      { ticker: 'AGG', category: 'bond' as const },
      { ticker: 'BND', category: 'bond' as const },
      { ticker: 'IEF', category: 'bond' as const },
      { ticker: 'LQD', category: 'bond' as const },
    ]

    const heatmapItems: Array<TopMover & { category: 'stock' | 'etf' | 'bond' }> = []

    for (const { ticker, category } of tickers) {
      try {
        const quote = await getStockQuote(ticker)
        if (quote) {
          heatmapItems.push({
            ticker: quote.ticker,
            name: quote.name,
            change: quote.change,
            changePercent: quote.changePercent,
            price: quote.price,
            category
          })
        }
      } catch (error) {
        console.error(`Error loading ${ticker}:`, error)
      }
    }

    setHeatmapData(heatmapItems)
    setCache('dashboard_heatmap', heatmapItems)
  }

  function getSector(ticker: string): string {
    const sectors: {[key: string]: string} = {
      'AAPL': 'Tech', 'MSFT': 'Tech', 'GOOGL': 'Tech', 'META': 'Tech', 'NVDA': 'Tech', 'AMD': 'Tech',
      'TSLA': 'Auto', 'F': 'Auto', 'GM': 'Auto',
      'JPM': 'Finance', 'BAC': 'Finance', 'WFC': 'Finance', 'C': 'Finance',
      'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare',
      'XOM': 'Energy', 'CVX': 'Energy',
      'SPY': 'ETF', 'QQQ': 'ETF', 'VOO': 'ETF',
      'TLT': 'Bonds', 'AGG': 'Bonds', 'BND': 'Bonds'
    }
    return sectors[ticker] || 'Other'
  }

  const anyLoading = loadingIndices || loadingNews || loadingTopMovers || loadingHeatmap

  return (
    <FadeIn>
      <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen de mercado y tus inversiones</p>
      </div>

      {/* Investment Quote - shown while loading */}
      {anyLoading && <InvestmentQuote />}

      {/* Portfolio Metrics */}
      {portfolios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg glow-blue">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Valor Total</p>
                <p className="text-2xl font-bold font-mono-numbers">
                  <CountUp end={metrics.totalValue} decimals={2} prefix="$" />
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg glow-purple">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Invertido</p>
                <p className="text-2xl font-bold font-mono-numbers">
                  <CountUp end={metrics.totalCost} decimals={2} prefix="$" />
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${metrics.totalPnL >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-500 glow-green' : 'bg-gradient-to-br from-red-500 to-orange-500 glow-red'}`}>
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold font-mono-numbers ${metrics.totalPnL >= 0 ? 'text-gradient-profit' : 'text-gradient-loss'}`}>
                  {metrics.totalPnL >= 0 ? '+' : ''}
                  <CountUp end={Math.abs(metrics.totalPnL)} decimals={2} prefix="$" />
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${metrics.totalPnLPercent >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-500 glow-green' : 'bg-gradient-to-br from-red-500 to-orange-500 glow-red'}`}>
                {metrics.totalPnLPercent >= 0 ? (
                  <TrendingUp className="text-white" size={24} />
                ) : (
                  <TrendingDown className="text-white" size={24} />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">ROI</p>
                <p className={`text-3xl font-bold font-mono-numbers ${metrics.totalPnLPercent >= 0 ? 'text-gradient-profit' : 'text-gradient-loss'}`}>
                  {metrics.totalPnLPercent >= 0 ? '+' : ''}
                  <CountUp end={Math.abs(metrics.totalPnLPercent)} decimals={2} suffix="%" />
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Market Indices */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gradient">Índices de Mercado</h2>
        {loadingIndices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <Card key={index.ticker}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{index.ticker}</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(index.price)}</p>
                </div>
                {index.change >= 0 ? (
                  <TrendingUp className="text-profit" size={32} />
                ) : (
                  <TrendingDown className="text-loss" size={32} />
                )}
              </div>
              <p
                className={`text-sm mt-2 ${
                  index.change >= 0 ? 'text-profit' : 'text-loss'
                }`}
              >
                {formatPercent(index.changePercent)}
              </p>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Market Heatmap */}
      {loadingHeatmap ? (
        <Card>
          <h2 className="text-2xl font-bold mb-4 text-gradient">Market Overview</h2>
          <p className="text-sm text-gray-400 mb-4">Cargando vista del mercado...</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg shimmer" />
            ))}
          </div>
        </Card>
      ) : heatmapData.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold mb-4 text-gradient">Market Overview</h2>
          <p className="text-sm text-gray-400 mb-4">Vista en tiempo real del mercado - Acciones, ETFs y Bonos</p>
          <MarketHeatmap items={heatmapData} />
        </Card>
      )}

      {/* Top Gainers & Losers */}
      {loadingTopMovers ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold">Top Gainers</h2>
          </div>
          <div className="space-y-2">
            {topGainers.map((stock) => (
              <div
                key={stock.ticker}
                onClick={() => navigate(`/stock/${stock.ticker}`)}
                className="p-3 bg-background rounded-lg border border-border hover:border-green-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stock.ticker}</p>
                    <p className="text-sm text-gray-400">{formatCurrency(stock.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-profit font-bold">+{formatPercent(stock.changePercent)}</p>
                    <p className="text-sm text-gray-400">+{formatCurrency(stock.change)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
              <TrendingDown className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold">Top Losers</h2>
          </div>
          <div className="space-y-2">
            {topLosers.map((stock) => (
              <div
                key={stock.ticker}
                onClick={() => navigate(`/stock/${stock.ticker}`)}
                className="p-3 bg-background rounded-lg border border-border hover:border-red-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stock.ticker}</p>
                    <p className="text-sm text-gray-400">{formatCurrency(stock.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-loss font-bold">{formatPercent(stock.changePercent)}</p>
                    <p className="text-sm text-gray-400">{formatCurrency(stock.change)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      )}

      {/* Portfolios & Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tus Portfolios</h2>
            <Link to="/portfolio-builder">
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                + Crear Nuevo
              </button>
            </Link>
          </div>
          {portfolios.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="mx-auto text-gray-600 mb-3" size={48} />
              <p className="text-gray-400 mb-4">No tienes portfolios creados aún.</p>
              <Link to="/portfolio-builder">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Crear tu primer Portfolio
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  onClick={() => navigate('/portfolio')}
                  className="p-4 bg-background rounded-lg border border-border hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{portfolio.name}</p>
                      <p className="text-sm text-gray-400">
                        {portfolio.positions.length} posiciones
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Tipo</p>
                      <p className="text-sm font-medium capitalize">{portfolio.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} />
            <h2 className="text-xl font-bold">Distribución por Sector</h2>
          </div>
          {Object.keys(sectorAllocation).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Crea un portfolio para ver la distribución</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(sectorAllocation)
                .sort(([, a], [, b]) => b - a)
                .map(([sector, value]) => {
                  const percentage = (value / metrics.totalValue) * 100
                  return (
                    <div key={sector}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{sector}</span>
                        <span className="text-sm text-gray-400">
                          {formatCurrency(value)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={20} />
            <h2 className="text-xl font-bold">Noticias del Mercado</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {news.slice(0, 10).map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-background rounded-lg border border-border hover:border-blue-500 transition-colors"
              >
                <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{item.source}</p>
              </a>
            ))}
          </div>
        </Card>
      </div>

      {!hasLLMConfig() && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-1" size={24} />
            <div>
              <p className="font-medium text-yellow-500 mb-1">
                ⚠️ No has configurado tus API keys
              </p>
              <p className="text-sm text-yellow-400">
                Ve a <Link to="/settings" className="underline hover:text-yellow-300">Configuración</Link> para agregar tus claves y desbloquear todas las funcionalidades.
              </p>
            </div>
          </div>
        </Card>
      )}
      </div>
    </FadeIn>
  )
}
