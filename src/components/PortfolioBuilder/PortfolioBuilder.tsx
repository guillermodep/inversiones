import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { getStockQuote } from '@/services/marketDataService'
import { StockData } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Cpu, Heart, Pill, Zap, Building2, ShoppingCart, Car, DollarSign, ShoppingBag, Home, Plus, Trash2 } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const industries: Array<{ label: string; value: string; tickers: string[]; icon: any }> = [
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
  { label: 'ETFs', value: 'ETFS', tickers: ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'DIA', 'EEM', 'GLD'], icon: null },
]

export default function PortfolioBuilder() {
  const { addPortfolio } = useStore()
  const [horizon, setHorizon] = useState('')
  const [risk, setRisk] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [availableStocks, setAvailableStocks] = useState<StockData[]>([])
  const [selectedStocks, setSelectedStocks] = useState<Array<{ stock: StockData; allocation: number }>>([])
  const [loading, setLoading] = useState(false)
  const [portfolioName, setPortfolioName] = useState('')

  useEffect(() => {
    if (selectedIndustry) {
      loadIndustryStocks()
    }
  }, [selectedIndustry])

  async function loadIndustryStocks() {
    const industry = industries.find(ind => ind.value === selectedIndustry)
    if (!industry || industry.tickers.length === 0) return

    setLoading(true)
    const stocks: StockData[] = []
    
    for (const ticker of industry.tickers.slice(0, 8)) {
      const stock = await getStockQuote(ticker)
      if (stock) stocks.push(stock)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setAvailableStocks(stocks)
    setLoading(false)
  }

  function addToPortfolio(stock: StockData) {
    if (selectedStocks.find(s => s.stock.ticker === stock.ticker)) return
    
    const remainingAllocation = 100 - selectedStocks.reduce((sum, s) => sum + s.allocation, 0)
    const suggestedAllocation = Math.min(remainingAllocation, 20)
    
    setSelectedStocks([...selectedStocks, { stock, allocation: suggestedAllocation }])
  }

  function removeFromPortfolio(ticker: string) {
    setSelectedStocks(selectedStocks.filter(s => s.stock.ticker !== ticker))
  }

  function updateAllocation(ticker: string, allocation: number) {
    setSelectedStocks(selectedStocks.map(s => 
      s.stock.ticker === ticker ? { ...s, allocation } : s
    ))
  }

  function handleCreatePortfolio() {
    const totalAllocation = selectedStocks.reduce((sum, s) => sum + s.allocation, 0)
    
    if (totalAllocation !== 100) {
      alert(`La asignación total debe ser 100%. Actual: ${totalAllocation}%`)
      return
    }

    if (!portfolioName.trim()) {
      alert('Ingresa un nombre para el portfolio')
      return
    }

    const positions = selectedStocks.map(item => ({
      ticker: item.stock.ticker,
      shares: 0,
      purchasePrice: item.stock.price,
      purchaseDate: new Date().toISOString().split('T')[0],
    }))

    const newPortfolio = {
      id: Date.now().toString(),
      name: portfolioName,
      type: horizon === '1-6 meses' ? 'short-term' as const : 'long-term' as const,
      positions,
      createdAt: new Date().toISOString(),
    }
    
    addPortfolio(newPortfolio)
    alert('Portfolio creado exitosamente')
    
    setSelectedStocks([])
    setPortfolioName('')
    setHorizon('')
    setRisk('')
    setSelectedIndustry('')
  }

  const totalAllocation = selectedStocks.reduce((sum, s) => sum + s.allocation, 0)
  const remainingAllocation = 100 - totalAllocation

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Constructor de Portfolio</h1>
        <p className="text-gray-400 mt-1">Crea un portfolio personalizado seleccionando instrumentos por industria</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración */}
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Configuración</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Portfolio</label>
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="Mi Portfolio 2026"
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Horizonte Temporal</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              >
                <option value="">Selecciona...</option>
                <option value="1-6 meses">Corto plazo (1-6 meses)</option>
                <option value="1-3 años">Mediano plazo (1-3 años)</option>
                <option value="5+ años">Largo plazo (5+ años)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tolerancia al Riesgo</label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              >
                <option value="">Selecciona...</option>
                <option value="Conservador">Conservador</option>
                <option value="Moderado">Moderado</option>
                <option value="Agresivo">Agresivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industria</label>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => {
                  const Icon = industry.icon
                  return (
                    <button
                      key={industry.value}
                      onClick={() => setSelectedIndustry(industry.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1.5 ${
                        selectedIndustry === industry.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {Icon && <Icon size={14} />}
                      {industry.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Instrumentos Disponibles */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">
            Instrumentos Disponibles
            {selectedIndustry && ` - ${industries.find(i => i.value === selectedIndustry)?.label}`}
          </h2>
          
          {!selectedIndustry ? (
            <p className="text-gray-400 text-center py-8">Selecciona una industria para ver instrumentos disponibles</p>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {availableStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{stock.ticker}</p>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(stock.price)}</p>
                      <p className={`text-sm ${stock.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercent(stock.changePercent)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToPortfolio(stock)}
                      disabled={selectedStocks.find(s => s.stock.ticker === stock.ticker) !== undefined}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Portfolio Seleccionado */}
      {selectedStocks.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tu Portfolio</h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Asignación Total</p>
              <p className={`text-2xl font-bold ${totalAllocation === 100 ? 'text-profit' : 'text-yellow-500'}`}>
                {totalAllocation}%
              </p>
              {remainingAllocation > 0 && (
                <p className="text-sm text-gray-400">Restante: {remainingAllocation}%</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Ticker</th>
                  <th className="py-2 px-4">Nombre</th>
                  <th className="py-2 px-4 text-right">Precio</th>
                  <th className="py-2 px-4 text-right">Asignación %</th>
                  <th className="py-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {selectedStocks.map(({ stock, allocation }) => (
                  <tr key={stock.ticker} className="border-b border-border">
                    <td className="py-3 px-4 font-medium">{stock.ticker}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{stock.name}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(stock.price)}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={allocation}
                        onChange={(e) => updateAllocation(stock.ticker, parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="5"
                        className="w-20 bg-background border border-border rounded px-2 py-1 text-right"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => removeFromPortfolio(stock.ticker)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCreatePortfolio}
              disabled={totalAllocation !== 100 || !portfolioName || !horizon || !risk}
            >
              Crear Portfolio
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedStocks([])}
            >
              Limpiar Todo
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
