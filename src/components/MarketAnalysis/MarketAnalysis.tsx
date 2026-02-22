import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchStocks, getStockQuote } from '@/services/marketDataService'
import { StockData } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import { formatCurrency, formatPercent, formatLargeNumber } from '@/utils/formatters'
import { Search } from 'lucide-react'

export default function MarketAnalysis() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [popularStocks, setPopularStocks] = useState<StockData[]>([])
  const [popularETFs, setPopularETFs] = useState<StockData[]>([])
  const [popularBonds, setPopularBonds] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPopularStocks()
    loadPopularETFs()
    loadPopularBonds()
  }, [])

  async function loadPopularStocks() {
    const tickers = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM',
      'V', 'WMT', 'DIS', 'NFLX', 'PYPL', 'INTC', 'AMD', 'BABA'
    ]
    const results = await Promise.all(
      tickers.map((ticker) => getStockQuote(ticker))
    )
    setPopularStocks(results.filter((r): r is StockData => r !== null))
  }

  async function loadPopularETFs() {
    const tickers = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'DIA', 'EEM', 'GLD']
    const results = await Promise.all(
      tickers.map((ticker) => getStockQuote(ticker))
    )
    setPopularETFs(results.filter((r): r is StockData => r !== null))
  }

  async function loadPopularBonds() {
    const tickers = ['TLT', 'IEF', 'SHY', 'AGG', 'BND', 'LQD', 'HYG', 'MUB']
    const results = await Promise.all(
      tickers.map((ticker) => getStockQuote(ticker))
    )
    setPopularBonds(results.filter((r): r is StockData => r !== null))
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const results = await searchStocks(searchQuery)
      const detailedResults = await Promise.all(
        results.slice(0, 10).map(async (stock) => {
          const quote = await getStockQuote(stock.ticker)
          return quote || stock
        })
      )
      setSearchResults(detailedResults)
    } catch (error) {
      console.error('Error searching stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  function StockRow({ stock }: { stock: StockData }) {
    return (
      <tr
        onClick={() => navigate(`/stock/${stock.ticker}`)}
        className="border-b border-border hover:bg-gray-800 cursor-pointer transition-colors"
      >
        <td className="py-3 px-4">
          <div>
            <p className="font-medium">{stock.ticker}</p>
            <p className="text-sm text-gray-400">{stock.name}</p>
          </div>
        </td>
        <td className="py-3 px-4 text-right">{formatCurrency(stock.price)}</td>
        <td className={`py-3 px-4 text-right ${stock.change >= 0 ? 'text-profit' : 'text-loss'}`}>
          {formatPercent(stock.changePercent)}
        </td>
        <td className="py-3 px-4 text-right text-sm text-gray-400">
          {formatLargeNumber(stock.volume)}
        </td>
        <td className="py-3 px-4 text-right text-sm text-gray-400">
          {stock.marketCap ? formatLargeNumber(stock.marketCap) : 'N/A'}
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis de Mercado</h1>
        <p className="text-gray-400 mt-1">Busca y analiza acciones</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ticker o nombre (ej: AAPL, Apple, Tesla)"
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Resultados de Búsqueda</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Acción</th>
                  <th className="py-2 px-4 text-right">Precio</th>
                  <th className="py-2 px-4 text-right">Cambio</th>
                  <th className="py-2 px-4 text-right">Volumen</th>
                  <th className="py-2 px-4 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((stock) => (
                  <StockRow key={stock.ticker} stock={stock} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-xl font-bold mb-4">Acciones Populares</h2>
        {popularStocks.length === 0 ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Acción</th>
                  <th className="py-2 px-4 text-right">Precio</th>
                  <th className="py-2 px-4 text-right">Cambio</th>
                  <th className="py-2 px-4 text-right">Volumen</th>
                  <th className="py-2 px-4 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {popularStocks.map((stock) => (
                  <StockRow key={stock.ticker} stock={stock} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">ETFs Populares</h2>
        {popularETFs.length === 0 ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">ETF</th>
                  <th className="py-2 px-4 text-right">Precio</th>
                  <th className="py-2 px-4 text-right">Cambio</th>
                  <th className="py-2 px-4 text-right">Volumen</th>
                  <th className="py-2 px-4 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {popularETFs.map((stock) => (
                  <StockRow key={stock.ticker} stock={stock} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Bonos y ETFs de Renta Fija</h2>
        {popularBonds.length === 0 ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Bono/ETF</th>
                  <th className="py-2 px-4 text-right">Precio</th>
                  <th className="py-2 px-4 text-right">Cambio</th>
                  <th className="py-2 px-4 text-right">Volumen</th>
                  <th className="py-2 px-4 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {popularBonds.map((stock) => (
                  <StockRow key={stock.ticker} stock={stock} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
