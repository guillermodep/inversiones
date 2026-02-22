import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStockQuote } from '@/services/marketDataService'
import { StockData } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import { TrendingUp, DollarSign, Zap, Award, Building, Sparkles } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const strategies = [
  {
    id: 'value',
    name: 'Value Investing',
    description: 'P/E bajo (<20), dividendos sólidos, empresas infravaloradas',
    icon: DollarSign,
    tickers: ['KO', 'PG', 'JNJ', 'PFE', 'VZ', 'T', 'XOM', 'CVX'],
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
    tickers: ['KO', 'PG', 'JNJ', 'MMM', 'MCD', 'WMT', 'CAT', 'IBM'],
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
    tickers: ['NVDA', 'TSLA', 'META', 'GOOGL', 'MSFT', 'AMD', 'NFLX', 'AMZN'],
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
    tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'TSLA', 'AMD', 'NFLX'],
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
    tickers: ['AAPL', 'MSFT', 'JNJ', 'JPM', 'V', 'MA', 'UNH', 'PG'],
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
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'ORCL'],
    criteria: () => true
  },
]

export default function Screener() {
  const navigate = useNavigate()
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
            {results.length > 0 && (
              <p className="text-sm text-gray-400">{results.length} acciones encontradas</p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : results.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No se encontraron resultados para esta estrategia</p>
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
