import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { getStockQuote } from '@/services/marketDataService'
import { StockData } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Trash2, Search, Plus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/utils/formatters'

export default function PortfolioBuilder() {
  const { addPortfolio } = useStore()
  const [horizon, setHorizon] = useState('')
  const [risk, setRisk] = useState('')
  const [recommendations, setRecommendations] = useState<Array<{ stock: StockData; allocation: number; reason: string }>>([])
  const [selectedStocks, setSelectedStocks] = useState<Array<{ stock: StockData; allocation: number }>>([])
  const [loading, setLoading] = useState(false)
  const [portfolioName, setPortfolioName] = useState('')
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<StockData | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (horizon && risk) {
      generateRecommendations()
    }
  }, [horizon, risk])

  async function generateRecommendations() {
    setLoading(true)
    const recs: Array<{ stock: StockData; allocation: number; reason: string }> = []
    
    // Definir estrategia según horizonte y riesgo
    let strategy: Array<{ ticker: string; allocation: number; reason: string }> = []
    
    if (horizon === '1-6 meses') {
      // Corto plazo
      if (risk === 'Conservador') {
        strategy = [
          { ticker: 'SHY', allocation: 40, reason: 'Bonos del Tesoro a corto plazo - Máxima seguridad y liquidez' },
          { ticker: 'AGG', allocation: 30, reason: 'ETF de bonos agregados - Diversificación en renta fija' },
          { ticker: 'GLD', allocation: 20, reason: 'Oro - Protección contra volatilidad' },
          { ticker: 'AAPL', allocation: 10, reason: 'Apple - Blue chip estable con dividendos' },
        ]
      } else if (risk === 'Moderado') {
        strategy = [
          { ticker: 'SPY', allocation: 30, reason: 'S&P 500 - Diversificación en mercado general' },
          { ticker: 'QQQ', allocation: 25, reason: 'Nasdaq 100 - Exposición a tech de calidad' },
          { ticker: 'IEF', allocation: 25, reason: 'Bonos 7-10 años - Balance riesgo/retorno' },
          { ticker: 'MSFT', allocation: 20, reason: 'Microsoft - Líder tech con crecimiento estable' },
        ]
      } else {
        strategy = [
          { ticker: 'TSLA', allocation: 25, reason: 'Tesla - Alto potencial de crecimiento' },
          { ticker: 'NVDA', allocation: 25, reason: 'Nvidia - Líder en IA y semiconductores' },
          { ticker: 'QQQ', allocation: 30, reason: 'Nasdaq 100 - Exposición a tech growth' },
          { ticker: 'AMD', allocation: 20, reason: 'AMD - Crecimiento en chips y data centers' },
        ]
      }
    } else if (horizon === '1-3 años') {
      // Mediano plazo
      if (risk === 'Conservador') {
        strategy = [
          { ticker: 'VOO', allocation: 30, reason: 'Vanguard S&P 500 - Diversificación de bajo costo' },
          { ticker: 'IEF', allocation: 25, reason: 'Bonos 7-10 años - Estabilidad de mediano plazo' },
          { ticker: 'JNJ', allocation: 20, reason: 'Johnson & Johnson - Dividendos consistentes' },
          { ticker: 'PG', allocation: 15, reason: 'Procter & Gamble - Consumo defensivo' },
          { ticker: 'VNQ', allocation: 10, reason: 'Real Estate - Diversificación en bienes raíces' },
        ]
      } else if (risk === 'Moderado') {
        strategy = [
          { ticker: 'VTI', allocation: 35, reason: 'Total Market - Máxima diversificación' },
          { ticker: 'MSFT', allocation: 20, reason: 'Microsoft - Crecimiento sostenible en cloud' },
          { ticker: 'GOOGL', allocation: 15, reason: 'Google - Dominio en búsqueda y cloud' },
          { ticker: 'JPM', allocation: 15, reason: 'JP Morgan - Líder financiero sólido' },
          { ticker: 'IEF', allocation: 15, reason: 'Bonos - Balance de cartera' },
        ]
      } else {
        strategy = [
          { ticker: 'NVDA', allocation: 25, reason: 'Nvidia - Revolución de IA' },
          { ticker: 'TSLA', allocation: 20, reason: 'Tesla - Transformación energética' },
          { ticker: 'META', allocation: 20, reason: 'Meta - Líder en redes sociales y metaverso' },
          { ticker: 'AMD', allocation: 20, reason: 'AMD - Competidor fuerte en semiconductores' },
          { ticker: 'GOOGL', allocation: 15, reason: 'Google - Innovación en IA' },
        ]
      }
    } else {
      // Largo plazo (5+ años)
      if (risk === 'Conservador') {
        strategy = [
          { ticker: 'VTI', allocation: 40, reason: 'Total Market - Crecimiento del mercado a largo plazo' },
          { ticker: 'BND', allocation: 25, reason: 'Bonos totales - Estabilidad y dividendos' },
          { ticker: 'JNJ', allocation: 15, reason: 'Johnson & Johnson - Aristocrat de dividendos' },
          { ticker: 'KO', allocation: 10, reason: 'Coca-Cola - Marca global resiliente' },
          { ticker: 'VNQ', allocation: 10, reason: 'Real Estate - Apreciación a largo plazo' },
        ]
      } else if (risk === 'Moderado') {
        strategy = [
          { ticker: 'VOO', allocation: 30, reason: 'S&P 500 - Crecimiento histórico comprobado' },
          { ticker: 'QQQ', allocation: 25, reason: 'Nasdaq - Innovación tecnológica' },
          { ticker: 'MSFT', allocation: 20, reason: 'Microsoft - Líder en transformación digital' },
          { ticker: 'AAPL', allocation: 15, reason: 'Apple - Ecosistema y lealtad de marca' },
          { ticker: 'VEA', allocation: 10, reason: 'Mercados desarrollados - Diversificación global' },
        ]
      } else {
        strategy = [
          { ticker: 'QQQ', allocation: 30, reason: 'Nasdaq - Máximo potencial de crecimiento tech' },
          { ticker: 'NVDA', allocation: 25, reason: 'Nvidia - Futuro de IA y computación' },
          { ticker: 'TSLA', allocation: 20, reason: 'Tesla - Energía limpia y autonomía' },
          { ticker: 'GOOGL', allocation: 15, reason: 'Google - Dominio en datos e IA' },
          { ticker: 'AMD', allocation: 10, reason: 'AMD - Crecimiento en gaming y data centers' },
        ]
      }
    }
    
    // Cargar datos reales de las acciones recomendadas
    for (const item of strategy) {
      const stock = await getStockQuote(item.ticker)
      if (stock) {
        recs.push({
          stock,
          allocation: item.allocation,
          reason: item.reason
        })
      }
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setRecommendations(recs)
    setLoading(false)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchResult(null)
    
    try {
      const stock = await getStockQuote(searchQuery.toUpperCase().trim())
      setSearchResult(stock)
    } catch (error) {
      console.error('Search error:', error)
      alert('No se encontró el instrumento. Verifica el ticker.')
    } finally {
      setSearching(false)
    }
  }

  function addSearchResult() {
    if (!searchResult) return
    
    if (selectedStocks.find(s => s.stock.ticker === searchResult.ticker)) {
      alert('Este instrumento ya está en tu portfolio')
      return
    }
    
    const remainingAllocation = 100 - selectedStocks.reduce((sum, s) => sum + s.allocation, 0)
    const suggestedAllocation = Math.min(remainingAllocation, 20)
    
    setSelectedStocks([...selectedStocks, { stock: searchResult, allocation: suggestedAllocation }])
    setSearchQuery('')
    setSearchResult(null)
  }

  function acceptAllRecommendations() {
    setSelectedStocks(recommendations.map(r => ({ stock: r.stock, allocation: r.allocation })))
  }
  
  function acceptRecommendation(rec: { stock: StockData; allocation: number; reason: string }) {
    if (selectedStocks.find(s => s.stock.ticker === rec.stock.ticker)) return
    setSelectedStocks([...selectedStocks, { stock: rec.stock, allocation: rec.allocation }])
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

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      alert('Ingresa un monto a invertir válido')
      return
    }

    const amount = parseFloat(investmentAmount)

    const positions = selectedStocks.map(item => {
      const allocatedAmount = (amount * item.allocation) / 100
      const shares = Math.floor(allocatedAmount / item.stock.price)
      
      return {
        ticker: item.stock.ticker,
        shares,
        purchasePrice: item.stock.price,
        purchaseDate: new Date().toISOString().split('T')[0],
      }
    })

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
    setInvestmentAmount('')
    setHorizon('')
    setRisk('')
    setRecommendations([])
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
              <label className="block text-sm font-medium mb-2">Monto a Invertir (USD)</label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="10000"
                min="0"
                step="100"
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

            {horizon && risk && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-medium text-blue-400">Estrategia Seleccionada</p>
                <p className="text-sm text-gray-300 mt-1">
                  {horizon} • {risk}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Recomendaciones */}
        <Card className="lg:col-span-2">
          {/* Buscador de instrumentos */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Buscar Instrumento</h3>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por ticker (ej: AAPL, TSLA, SPY)"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2"
                />
              </div>
              <Button type="submit" disabled={searching || !searchQuery.trim()}>
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </form>
            
            {searchResult && (
              <div className="mt-3 p-4 bg-background rounded-lg border border-blue-500/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg">{searchResult.ticker}</p>
                    </div>
                    <p className="text-sm text-gray-400">{searchResult.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(searchResult.price)}</p>
                      <p className={`text-sm ${searchResult.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercent(searchResult.changePercent)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={addSearchResult}
                      disabled={selectedStocks.find(s => s.stock.ticker === searchResult.ticker) !== undefined}
                    >
                      <Plus size={16} className="mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recomendaciones Personalizadas</h2>
              {recommendations.length > 0 && (
                <Button size="sm" onClick={acceptAllRecommendations}>
                  Aceptar Todas
                </Button>
              )}
            </div>
            
            {!horizon || !risk ? (
              <p className="text-gray-400 text-center py-8">Selecciona horizonte temporal y tolerancia al riesgo para ver recomendaciones</p>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.stock.ticker}
                  className="p-4 bg-background rounded-lg border border-border hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{rec.stock.ticker}</p>
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          {rec.allocation}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{rec.stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(rec.stock.price)}</p>
                      <p className={`text-sm ${rec.stock.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercent(rec.stock.changePercent)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 italic">💡 {rec.reason}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => acceptRecommendation(rec)}
                    disabled={selectedStocks.find(s => s.stock.ticker === rec.stock.ticker) !== undefined}
                  >
                    {selectedStocks.find(s => s.stock.ticker === rec.stock.ticker) ? 'Agregado' : 'Agregar al Portfolio'}
                  </Button>
                </div>
              ))}
            </div>
            )}
          </div>
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
                  {investmentAmount && <th className="py-2 px-4 text-right">Monto</th>}
                  {investmentAmount && <th className="py-2 px-4 text-right">Acciones</th>}
                  <th className="py-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {selectedStocks.map(({ stock, allocation }) => {
                  const amount = investmentAmount ? parseFloat(investmentAmount) : 0
                  const allocatedAmount = (amount * allocation) / 100
                  const shares = amount > 0 ? Math.floor(allocatedAmount / stock.price) : 0
                  
                  return (
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
                      {investmentAmount && (
                        <td className="py-3 px-4 text-right text-sm text-gray-300">
                          {formatCurrency(allocatedAmount)}
                        </td>
                      )}
                      {investmentAmount && (
                        <td className="py-3 px-4 text-right text-sm text-gray-300">
                          {shares}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => removeFromPortfolio(stock.ticker)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCreatePortfolio}
              disabled={totalAllocation !== 100 || !portfolioName || !horizon || !risk || !investmentAmount}
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
