import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Portfolio as PortfolioType, PortfolioPosition } from '@/types'
import { calculatePortfolioValue, calculatePositionPnL } from '@/services/portfolioService'
import { analyzePortfolio } from '@/services/llmService'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { Plus, Trash2, Sparkles, Edit2, Check, X } from 'lucide-react'
import { hasLLMConfig } from '@/config/env'

export default function Portfolio() {
  const { portfolios, addPortfolio, deletePortfolio, selectedPortfolio, setSelectedPortfolio } = useStore()
  const [showNewPortfolio, setShowNewPortfolio] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [newPortfolioType, setNewPortfolioType] = useState<PortfolioType['type']>('long-term')
  const [portfolioValues, setPortfolioValues] = useState<Record<string, any>>({})
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [editingShares, setEditingShares] = useState<{positionIndex: number, value: string} | null>(null)

  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio)

  useEffect(() => {
    loadPortfolioValues()
  }, [portfolios])

  async function loadPortfolioValues() {
    const values: Record<string, any> = {}
    for (const portfolio of portfolios) {
      const result = await calculatePortfolioValue(portfolio.positions)
      values[portfolio.id] = result
    }
    setPortfolioValues(values)
  }

  function handleUpdateShares(positionIndex: number, newShares: number) {
    if (!currentPortfolio || newShares < 0) return
    
    const updatedPositions = [...currentPortfolio.positions]
    updatedPositions[positionIndex] = {
      ...updatedPositions[positionIndex],
      shares: newShares
    }
    
    const { updatePortfolio } = useStore.getState()
    updatePortfolio(currentPortfolio.id, { positions: updatedPositions })
    setEditingShares(null)
    loadPortfolioValues()
  }

  function handleCreatePortfolio() {
    if (!newPortfolioName.trim()) return
    const newPortfolio: PortfolioType = {
      id: Date.now().toString(),
      name: newPortfolioName,
      type: newPortfolioType,
      positions: [],
      createdAt: new Date().toISOString(),
    }
    addPortfolio(newPortfolio)
    setNewPortfolioName('')
    setShowNewPortfolio(false)
  }

  async function handleAnalyzePortfolio() {
    if (!currentPortfolio || !hasLLMConfig()) {
      alert('Configura tu API key de LLM en Configuración para usar esta función')
      return
    }
    
    if (currentPortfolio.positions.length === 0) {
      alert('Este portfolio no tiene posiciones para analizar')
      return
    }
    
    setAnalyzing(true)
    setAiAnalysis('') // Clear previous analysis
    setAnalysisProgress(0)
    
    try {
      const positions = portfolioValues[currentPortfolio.id]?.positions || []
      
      if (positions.length === 0) {
        alert('No hay datos de precios disponibles para analizar')
        setAnalyzing(false)
        return
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 300)
      
      const analysis = await analyzePortfolio(positions)
      
      clearInterval(progressInterval)
      setAnalysisProgress(100)
      
      // Small delay to show 100%
      setTimeout(() => {
        setAiAnalysis(analysis)
        setAnalyzing(false)
        setAnalysisProgress(0)
      }, 500)
    } catch (error: any) {
      console.error('Error analyzing portfolio:', error)
      const errorMessage = error?.message || 'Error desconocido'
      alert(`Error al analizar el portfolio: ${errorMessage}\n\nVerifica tu configuración de API en Settings.`)
      setAiAnalysis('')
      setAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Portfolios</h1>
          <p className="text-gray-400 mt-1">Administra tus inversiones</p>
        </div>
        <Button onClick={() => setShowNewPortfolio(true)}>
          <Plus size={18} className="mr-2" />
          Nuevo Portfolio
        </Button>
      </div>

      {showNewPortfolio && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Crear Nuevo Portfolio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Mi Portfolio de Largo Plazo"
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={newPortfolioType}
                onChange={(e) => setNewPortfolioType(e.target.value as PortfolioType['type'])}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              >
                <option value="short-term">🚀 Corto Plazo (1-6 meses)</option>
                <option value="long-term">📈 Largo Plazo (5+ años)</option>
                <option value="liquidity">💵 Liquidez Inmediata</option>
                <option value="aggressive">⚡ Agresivo / Growth</option>
                <option value="conservative">🛡️ Conservador</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreatePortfolio}>Crear</Button>
              <Button variant="secondary" onClick={() => setShowNewPortfolio(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => {
          const value = portfolioValues[portfolio.id]
          return (
            <Card
              key={portfolio.id}
              className={`cursor-pointer transition-all ${
                selectedPortfolio === portfolio.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedPortfolio(portfolio.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{portfolio.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{portfolio.type}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePortfolio(portfolio.id)
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {value && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Valor Total</p>
                    <p className="text-xl font-bold">{formatCurrency(value.totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">P&L</p>
                    <p className={`text-lg font-medium ${value.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {formatCurrency(value.totalPnL)} ({formatPercent((value.totalPnL / value.totalCost) * 100)})
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">{portfolio.positions.length} posiciones</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {currentPortfolio && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{currentPortfolio.name}</h2>
              <Button onClick={handleAnalyzePortfolio} disabled={analyzing || !hasLLMConfig()}>
                <Sparkles size={18} className="mr-2" />
                {analyzing ? 'Analizando...' : 'Analizar con IA'}
              </Button>
            </div>
            
            {analyzing && (
              <ProgressBar 
                progress={analysisProgress} 
                message="Analizando portfolio con IA..."
              />
            )}
          </div>
          
          <div className="mt-4" />

          {currentPortfolio.positions.length === 0 ? (
            <p className="text-gray-400">No hay posiciones en este portfolio.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-border">
                    <th className="py-2 px-4">Ticker</th>
                    <th className="py-2 px-4 text-right">Acciones</th>
                    <th className="py-2 px-4 text-right">Precio Compra</th>
                    <th className="py-2 px-4 text-right">Precio Actual</th>
                    <th className="py-2 px-4 text-right">Variación</th>
                    <th className="py-2 px-4 text-right">P&L</th>
                    <th className="py-2 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioValues[currentPortfolio.id]?.positions.map((position: PortfolioPosition, idx: number) => {
                    const pnl = calculatePositionPnL(position)
                    const priceChange = position.currentPrice && position.purchasePrice 
                      ? ((position.currentPrice - position.purchasePrice) / position.purchasePrice) * 100
                      : 0
                    const isEditing = editingShares?.positionIndex === idx
                    
                    return (
                      <tr key={idx} className="border-b border-border">
                        <td className="py-3 px-4 font-medium">{position.ticker}</td>
                        <td className="py-3 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                value={editingShares.value}
                                onChange={(e) => setEditingShares({ positionIndex: idx, value: e.target.value })}
                                className="w-20 bg-background border border-border rounded px-2 py-1 text-right"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateShares(idx, parseFloat(editingShares.value) || 0)}
                                className="text-green-500 hover:text-green-400"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingShares(null)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span>{position.shares}</span>
                              <button
                                onClick={() => setEditingShares({ positionIndex: idx, value: position.shares.toString() })}
                                className="text-gray-400 hover:text-gray-200"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(position.purchasePrice)}</td>
                        <td className="py-3 px-4 text-right">
                          <div>{formatCurrency(position.currentPrice || 0)}</div>
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${priceChange >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {priceChange >= 0 ? '+' : ''}{formatPercent(priceChange)}
                        </td>
                        <td className={`py-3 px-4 text-right ${pnl.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {formatCurrency(pnl.pnl)} ({formatPercent(pnl.pnlPercent)})
                        </td>
                        <td className="py-3 px-4 text-right">{position.shares}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {aiAnalysis && (
            <div className="mt-6 p-4 bg-background rounded-lg border border-border">
              <h3 className="font-bold mb-2">Análisis del Portfolio</h3>
              <div className="text-gray-300 whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
