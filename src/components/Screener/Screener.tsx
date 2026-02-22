import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStockQuote } from '@/services/marketDataService'
import { StockData } from '@/types'
import { useStore } from '@/store/useStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import { TrendingUp, DollarSign, Zap, Award, Building, Sparkles, TrendingDown, Newspaper, Shield, Target } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const strategies = [
  {
    id: 'value',
    name: 'Value Investing',
    description: 'P/E bajo (<20), dividendos sólidos, empresas infravaloradas',
    icon: DollarSign,
    tickers: ['KO', 'PG', 'JNJ', 'PFE', 'VZ', 'T', 'XOM', 'CVX', 'TLT', 'AGG', 'BND'],
    criteria: (stock: StockData) => {
      const pe = stock.peRatio || 999
      const dividend = stock.dividendYield || 0
      return pe < 20 && pe > 0 && dividend > 2
    }
  },
  {
    id: 'dividend',
    name: 'Dividend Aristocrats',
    description: 'Rendimiento >3%, historial consistente de dividendos',
    icon: TrendingUp,
    tickers: ['KO', 'PG', 'JNJ', 'MMM', 'MCD', 'WMT', 'CAT', 'IBM', 'VYM', 'SCHD', 'DVY'],
    criteria: (stock: StockData) => {
      const dividend = stock.dividendYield || 0
      return dividend > 3
    }
  },
  {
    id: 'growth',
    name: 'High Growth',
    description: 'Crecimiento acelerado, líderes en innovación',
    icon: Zap,
    tickers: ['NVDA', 'TSLA', 'META', 'GOOGL', 'MSFT', 'AMD', 'NFLX', 'AMZN', 'QQQ', 'ARKK', 'VGT'],
    criteria: (stock: StockData) => {
      const change = stock.changePercent || 0
      return change > 0
    }
  },
  {
    id: 'momentum',
    name: 'Strong Momentum',
    description: 'Tendencia alcista fuerte, volumen alto',
    icon: Award,
    tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'TSLA', 'AMD', 'NFLX', 'SPY', 'QQQ', 'VOO'],
    criteria: (stock: StockData) => {
      const change = stock.changePercent || 0
      return change > 2
    }
  },
  {
    id: 'quality',
    name: 'Quality Companies',
    description: 'Blue chips, balance sólido, líderes de mercado',
    icon: Building,
    tickers: ['AAPL', 'MSFT', 'JNJ', 'JPM', 'V', 'MA', 'UNH', 'PG', 'VTI', 'VOO', 'SPY'],
    criteria: (stock: StockData) => {
      const marketCap = stock.marketCap || 0
      return marketCap > 100_000_000_000
    }
  },
  {
    id: 'tech',
    name: 'Tech Leaders',
    description: 'Líderes tecnológicos, innovación y crecimiento',
    icon: Sparkles,
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'ORCL', 'QQQ', 'VGT', 'XLK'],
    criteria: () => true
  },
  {
    id: 'ytd-winners',
    name: 'YTD Winners',
    description: 'Mejores rendimientos del año, momentum sostenido',
    icon: Target,
    tickers: ['NVDA', 'META', 'TSLA', 'AMD', 'GOOGL', 'MSFT', 'NFLX', 'AMZN', 'QQQ', 'SPY', 'VGT'],
    criteria: (stock: StockData) => {
      const change = stock.changePercent || 0
      return change > 5
    }
  },
  {
    id: 'earnings-beat',
    name: 'Earnings Beat',
    description: 'Empresas que superaron expectativas de revenue',
    icon: Award,
    tickers: ['NVDA', 'META', 'GOOGL', 'MSFT', 'AAPL', 'AMZN', 'NFLX', 'AMD', 'QQQ', 'VOO', 'VGT'],
    criteria: (stock: StockData) => {
      const change = stock.changePercent || 0
      const marketCap = stock.marketCap || 0
      return change > 3 && marketCap > 50_000_000_000
    }
  },
  {
    id: 'news-sentiment',
    name: 'Positive News',
    description: 'Análisis de noticias recientes con sentimiento positivo',
    icon: Newspaper,
    tickers: ['NVDA', 'TSLA', 'META', 'GOOGL', 'AAPL', 'MSFT', 'AMD', 'NFLX', 'QQQ', 'SPY', 'ARKK'],
    criteria: (stock: StockData) => {
      const change = stock.changePercent || 0
      return change > 1
    }
  },
  {
    id: 'defensive',
    name: 'Defensive Plays',
    description: 'Acciones defensivas, baja volatilidad, dividendos estables',
    icon: Shield,
    tickers: ['JNJ', 'PG', 'KO', 'PEP', 'WMT', 'MCD', 'UNH', 'CVS', 'TLT', 'AGG', 'BND', 'IEF'],
    criteria: (stock: StockData) => {
      const dividend = stock.dividendYield || 0
      const pe = stock.peRatio || 999
      return dividend > 2 && pe < 25
    }
  },
  {
    id: 'undervalued',
    name: 'Undervalued Gems',
    description: 'P/E bajo, potencial de revalorización',
    icon: DollarSign,
    tickers: ['INTC', 'F', 'BAC', 'WFC', 'C', 'PFE', 'CVX', 'XOM', 'VTV', 'IWD', 'SCHV'],
    criteria: (stock: StockData) => {
      const pe = stock.peRatio || 999
      return pe < 15 && pe > 0
    }
  },
  {
    id: 'contrarian',
    name: 'Contrarian Plays',
    description: 'Acciones en baja con potencial de rebote',
    icon: TrendingDown,
    tickers: ['INTC', 'DIS', 'PYPL', 'BABA', 'NIO', 'RIVN', 'LCID', 'F', 'EEM', 'VWO', 'IEMG'],
    criteria: (stock: StockData) => {
      const change = stock.changePercent || 0
      return change < -2
    }
  },
]

export default function Screener() {
  const navigate = useNavigate()
  const { addPortfolio } = useStore()
  const [selectedStrategy, setSelectedStrategy] = useState('')
  const [results, setResults] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedStrategy) {
      loadStrategyResults()
    }
  }, [selectedStrategy])

  async function loadStrategyResults() {
    const strategy = strategies.find(s => s.id === selectedStrategy)
    if (!strategy) return

    setLoading(true)
    const stocks: StockData[] = []

    for (const ticker of strategy.tickers) {
      try {
        const stock = await getStockQuote(ticker)
        if (stock && strategy.criteria(stock)) {
          stocks.push(stock)
        }
      } catch (error) {
        console.error(`Error loading ${ticker}:`, error)
      }
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setResults(stocks)
    setLoading(false)
  }

  function createPortfolioFromStrategy() {
    if (results.length === 0) return

    const strategy = strategies.find(s => s.id === selectedStrategy)
    if (!strategy) return

    const positions = results.map((stock) => ({
      ticker: stock.ticker,
      shares: 0, // User will need to set investment amount later
      purchasePrice: stock.price,
      purchaseDate: new Date().toISOString().split('T')[0],
    }))

    const newPortfolio = {
      id: Date.now().toString(),
      name: `${strategy.name} - ${new Date().toLocaleDateString()}`,
      type: 'long-term' as const,
      positions,
      createdAt: new Date().toISOString(),
    }

    addPortfolio(newPortfolio)
    alert(`Portfolio "${newPortfolio.name}" creado con ${results.length} instrumentos`)
    navigate('/portfolios')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screener de Acciones</h1>
        <p className="text-gray-400 mt-1">Descubre oportunidades de inversión</p>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4">Estrategias Predefinidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => {
            const Icon = strategy.icon
            return (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-4 rounded-lg border transition-colors text-left ${
                  selectedStrategy === strategy.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-border hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={20} className="text-blue-400" />
                  <p className="font-bold">{strategy.name}</p>
                </div>
                <p className="text-sm text-gray-400">{strategy.description}</p>
              </button>
            )
          })}
        </div>
      </Card>

      {selectedStrategy && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Resultados</h2>
            <div className="flex items-center gap-3">
              {results.length > 0 && (
                <>
                  <p className="text-sm text-gray-400">{results.length} instrumentos encontrados</p>
                  <Button
                    onClick={createPortfolioFromStrategy}
                  >
                    Crear Portfolio con esta Estrategia
                  </Button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-medium text-gray-300 mb-2">Este no es el momento de esta estrategia</p>
              <p className="text-gray-400">El mercado está mirando otras acciones. Prueba con otra estrategia.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-border">
                    <th className="py-2 px-4">Acción</th>
                    <th className="py-2 px-4 text-right">Precio</th>
                    <th className="py-2 px-4 text-right">Cambio</th>
                    <th className="py-2 px-4 text-right">P/E</th>
                    <th className="py-2 px-4 text-right">Dividend %</th>
                    <th className="py-2 px-4 text-right">Market Cap</th>
                    <th className="py-2 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock) => (
                    <tr key={stock.ticker} className="border-b border-border hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{stock.ticker}</p>
                          <p className="text-sm text-gray-400">{stock.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(stock.price)}</td>
                      <td className={`py-3 px-4 text-right ${
                        stock.changePercent >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {formatPercent(stock.changePercent)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-400">
                        {stock.marketCap ? `$${(stock.marketCap / 1_000_000_000).toFixed(1)}B` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" onClick={() => navigate(`/stock/${stock.ticker}`)}>
                          Ver Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
