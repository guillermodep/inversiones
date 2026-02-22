import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchStocks, getStockQuote } from '@/services/marketDataService'
import { StockData } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SkeletonTable } from '@/components/ui/Skeleton'
import FadeIn from '@/components/ui/FadeIn'
import { formatCurrency, formatPercent, formatLargeNumber } from '@/utils/formatters'
import { Search, Cpu, Heart, Pill, Zap, Building2, ShoppingCart, Car, DollarSign, ShoppingBag, Home, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const industries: Array<{ label: string; value: string; tickers: string[]; icon: any }> = [
  { label: 'Todas', value: 'ALL', tickers: [], icon: null },
  { label: 'Tech', value: 'TECH', tickers: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'NFLX'], icon: Cpu },
  { label: 'Healthcare', value: 'HEALTHCARE', tickers: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'ABT', 'MRK', 'LLY'], icon: Heart },
  { label: 'Pharma', value: 'PHARMA', tickers: ['PFE', 'ABBV', 'MRK', 'LLY', 'BMY', 'GILD', 'AMGN', 'REGN'], icon: Pill },
  { label: 'Energy', value: 'ENERGY', tickers: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO'], icon: Zap },
  { label: 'Banks', value: 'BANKS', tickers: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC'], icon: Building2 },
  { label: 'Retail', value: 'RETAIL', tickers: ['WMT', 'AMZN', 'HD', 'TGT', 'COST', 'LOW', 'TJX', 'DG'], icon: ShoppingCart },
  { label: 'Auto', value: 'AUTO', tickers: ['TSLA', 'F', 'GM', 'RIVN', 'LCID', 'NIO', 'LI', 'XPEV', 'VWAGY', 'TM', 'HMC', 'STLA'], icon: Car },
  { label: 'Bonos Tesoro', value: 'TREASURY', tickers: ['TLT', 'IEF', 'SHY', 'TIP', 'GOVT', 'VGSH', 'VGIT', 'VGLT'], icon: DollarSign },
  { label: 'Consumo', value: 'CONSUMER', tickers: ['PG', 'KO', 'PEP', 'MDLZ', 'CL', 'KMB', 'GIS', 'K'], icon: ShoppingBag },
  { label: 'Bienes Raíces', value: 'REALESTATE', tickers: ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'WELL'], icon: Home },
]

export default function MarketAnalysis() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [popularStocks, setPopularStocks] = useState<StockData[]>([])
  const [allStocks, setAllStocks] = useState<StockData[]>([])
  const [popularETFs, setPopularETFs] = useState<StockData[]>([])
  const [popularBonds, setPopularBonds] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('ALL')
  const [sortColumn, setSortColumn] = useState<'price' | 'change' | 'volume' | 'marketCap' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadPopularStocks()
    loadPopularETFs()
    loadPopularBonds()
  }, [])

  async function loadPopularStocks() {
    // Combinar todos los tickers de todas las industrias
    const allTickers = Array.from(new Set(
      industries.flatMap(ind => ind.tickers)
    ))
    
    // Load in batches to avoid rate limiting (429 errors)
    const batchSize = 5
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const validStocks: StockData[] = []
    
    for (let i = 0; i < allTickers.length; i += batchSize) {
      const batch = allTickers.slice(i, i + batchSize)
      const results = await Promise.all(
        batch.map((ticker) => getStockQuote(ticker))
      )
      validStocks.push(...results.filter((r): r is StockData => r !== null))
      
      // Update UI progressively
      setAllStocks([...validStocks])
      
      // Apply current filter if one is selected
      if (selectedIndustry === 'ALL') {
        setPopularStocks([...validStocks])
      } else {
        const selectedIndustryData = industries.find(ind => ind.value === selectedIndustry)
        if (selectedIndustryData) {
          const filtered = validStocks.filter(stock => 
            selectedIndustryData.tickers.includes(stock.ticker)
          )
          setPopularStocks(filtered)
        }
      }
      
      // Wait between batches to avoid rate limiting
      if (i + batchSize < allTickers.length) {
        await delay(1000) // 1 second delay between batches
      }
    }
  }

  function handleIndustryFilter(industry: string) {
    setSelectedIndustry(industry)
    if (industry === 'ALL') {
      setPopularStocks(allStocks)
    } else {
      const selectedIndustryData = industries.find(ind => ind.value === industry)
      if (selectedIndustryData) {
        const filtered = allStocks.filter(stock => 
          selectedIndustryData.tickers.includes(stock.ticker)
        )
        setPopularStocks(filtered)
      }
    }
  }

  function handleSort(column: 'price' | 'change' | 'volume' | 'marketCap') {
    const newDirection = sortColumn === column && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortColumn(column)
    setSortDirection(newDirection)

    const sortStocks = (stocks: StockData[]) => {
      return [...stocks].sort((a, b) => {
        let aVal = 0
        let bVal = 0

        switch (column) {
          case 'price':
            aVal = a.price
            bVal = b.price
            break
          case 'change':
            aVal = a.changePercent
            bVal = b.changePercent
            break
          case 'volume':
            aVal = a.volume
            bVal = b.volume
            break
          case 'marketCap':
            aVal = a.marketCap || 0
            bVal = b.marketCap || 0
            break
        }

        return newDirection === 'desc' ? bVal - aVal : aVal - bVal
      })
    }

    setPopularStocks(sortStocks(popularStocks))
    setPopularETFs(sortStocks(popularETFs))
    setPopularBonds(sortStocks(popularBonds))
  }

  function SortIcon({ column }: { column: 'price' | 'change' | 'volume' | 'marketCap' }) {
    if (sortColumn !== column) {
      return <ArrowUpDown size={14} className="inline ml-1 text-gray-500" />
    }
    return sortDirection === 'desc' ? 
      <ArrowDown size={14} className="inline ml-1 text-blue-400" /> : 
      <ArrowUp size={14} className="inline ml-1 text-blue-400" />
  }

  async function loadPopularETFs() {
    const tickers = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'DIA', 'EEM', 'GLD']
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const validETFs: StockData[] = []
    
    for (const ticker of tickers) {
      const result = await getStockQuote(ticker)
      if (result) validETFs.push(result)
      setPopularETFs([...validETFs])
      await delay(200) // Small delay between requests
    }
  }

  async function loadPopularBonds() {
    const tickers = ['TLT', 'IEF', 'SHY', 'AGG', 'BND', 'LQD', 'HYG', 'MUB']
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const validBonds: StockData[] = []
    
    for (const ticker of tickers) {
      const result = await getStockQuote(ticker)
      if (result) validBonds.push(result)
      setPopularBonds([...validBonds])
      await delay(200) // Small delay between requests
    }
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

  function getInstrumentType(ticker: string): string {
    // ETFs populares
    const etfs = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'DIA', 'EEM', 'GLD', 'SLV', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 'XLB', 'XLRE', 'VEA', 'VWO', 'IEFA', 'IEMG', 'AGG', 'BND', 'VNQ', 'VCIT', 'VCSH', 'BSV', 'BIV', 'BLV']
    
    // Bonos y renta fija
    const bonds = ['TLT', 'IEF', 'SHY', 'AGG', 'BND', 'LQD', 'HYG', 'MUB', 'TIP', 'VCIT', 'VCSH', 'BSV', 'BIV', 'BLV']
    
    if (bonds.includes(ticker)) {
      return 'Bono/ETF Renta Fija'
    } else if (etfs.includes(ticker)) {
      return 'ETF'
    } else {
      return 'Acción'
    }
  }

  function StockRow({ stock }: { stock: StockData }) {
    const instrumentType = getInstrumentType(stock.ticker)
    
    return (
      <tr
        onClick={() => navigate(`/stock/${stock.ticker}`)}
        className="border-b border-border hover:bg-gray-800 cursor-pointer transition-colors"
      >
        <td className="py-3 px-4">
          <div>
            <p className="font-medium">{stock.ticker}</p>
            <p className="text-sm text-gray-400">
              {stock.name} <span className="italic text-gray-500">({instrumentType})</span>
            </p>
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
        <p className="text-gray-400 mt-1">Busca y analiza acciones, ETFs, bonos y más</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ticker (ej: AAPL, SPY, TLT, QQQ, BABA)"
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
          <h2 className="text-xl font-bold mb-4">Resultados</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Instrumento</th>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Acciones Populares</h2>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {industries.map((industry) => {
            const Icon = industry.icon
            return (
              <button
                key={industry.value}
                onClick={() => handleIndustryFilter(industry.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1.5 ${
                  selectedIndustry === industry.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {Icon && <Icon size={16} />}
                {industry.label}
              </button>
            )
          })}
        </div>

        {popularStocks.length === 0 ? (
          <SkeletonTable rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Acción</th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Precio <SortIcon column="price" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('change')}
                  >
                    Cambio <SortIcon column="change" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('volume')}
                  >
                    Volumen <SortIcon column="volume" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap <SortIcon column="marketCap" />
                  </th>
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
          <SkeletonTable rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">ETF</th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Precio <SortIcon column="price" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('change')}
                  >
                    Cambio <SortIcon column="change" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('volume')}
                  >
                    Volumen <SortIcon column="volume" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap <SortIcon column="marketCap" />
                  </th>
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
          <SkeletonTable rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Bono/ETF</th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Precio <SortIcon column="price" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('change')}
                  >
                    Cambio <SortIcon column="change" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('volume')}
                  >
                    Volumen <SortIcon column="volume" />
                  </th>
                  <th 
                    className="py-2 px-4 text-right cursor-pointer hover:text-gray-200 transition-colors"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap <SortIcon column="marketCap" />
                  </th>
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
