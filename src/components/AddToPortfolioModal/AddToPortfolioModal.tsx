import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Portfolio, PortfolioPosition } from '@/types'
import Button from '@/components/ui/Button'
import { X, Plus, Check } from 'lucide-react'

interface AddToPortfolioModalProps {
  ticker: string
  name: string
  currentPrice: number
  onClose: () => void
}

export default function AddToPortfolioModal({ ticker, name, currentPrice, onClose }: AddToPortfolioModalProps) {
  const { portfolios, addPortfolio, updatePortfolio } = useStore()
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [shares, setShares] = useState<string>('1')
  const [purchasePrice, setPurchasePrice] = useState<string>(currentPrice.toString())
  const [showSuccess, setShowSuccess] = useState(false)

  function handleAddToPortfolio() {
    const sharesNum = parseFloat(shares)
    const priceNum = parseFloat(purchasePrice)

    if (isNaN(sharesNum) || sharesNum <= 0) {
      alert('Por favor ingresa una cantidad válida de acciones')
      return
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor ingresa un precio válido')
      return
    }

    if (isCreatingNew) {
      if (!newPortfolioName.trim()) {
        alert('Por favor ingresa un nombre para el portfolio')
        return
      }

      const newPortfolio: Portfolio = {
        id: Date.now().toString(),
        name: newPortfolioName.trim(),
        type: 'long-term',
        positions: [
          {
            ticker,
            shares: sharesNum,
            purchasePrice: priceNum,
            purchaseDate: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
      }

      addPortfolio(newPortfolio)
    } else {
      if (!selectedPortfolioId) {
        alert('Por favor selecciona un portfolio')
        return
      }

      const portfolio = portfolios.find(p => p.id === selectedPortfolioId)
      if (!portfolio) return

      const existingPosition = portfolio.positions.find(p => p.ticker === ticker)
      
      let updatedPositions: PortfolioPosition[]
      if (existingPosition) {
        // Average the purchase price
        const totalShares = existingPosition.shares + sharesNum
        const avgPrice = ((existingPosition.shares * existingPosition.purchasePrice) + (sharesNum * priceNum)) / totalShares
        
        updatedPositions = portfolio.positions.map(p =>
          p.ticker === ticker
            ? { ...p, shares: totalShares, purchasePrice: avgPrice }
            : p
        )
      } else {
        updatedPositions = [
          ...portfolio.positions,
          {
            ticker,
            shares: sharesNum,
            purchasePrice: priceNum,
            purchaseDate: new Date().toISOString(),
          }
        ]
      }

      updatePortfolio(selectedPortfolioId, { positions: updatedPositions })
    }

    setShowSuccess(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <Check className="text-green-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Agregado!</h2>
          <p className="text-gray-400">
            {shares} {parseFloat(shares) === 1 ? 'acción' : 'acciones'} de {ticker} agregadas al portfolio
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Agregar a Portfolio</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-gray-400">Instrumento</p>
          <p className="font-bold text-lg">{ticker}</p>
          <p className="text-sm text-gray-400">{name}</p>
          <p className="text-lg font-medium mt-2">${currentPrice.toFixed(2)}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Cantidad de acciones</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Precio de compra</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={currentPrice.toString()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Precio actual: ${currentPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setIsCreatingNew(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isCreatingNew
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Portfolio Existente
            </button>
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isCreatingNew
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Crear Nuevo
            </button>
          </div>

          {isCreatingNew ? (
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del nuevo portfolio</label>
              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Tech Growth, Dividendos, etc."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Seleccionar portfolio</label>
              {portfolios.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="mb-2">No tienes portfolios todavía</p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Crear tu primer portfolio
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {portfolios.map((portfolio) => (
                    <button
                      key={portfolio.id}
                      onClick={() => setSelectedPortfolioId(portfolio.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPortfolioId === portfolio.id
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <p className="font-medium">{portfolio.name}</p>
                      <p className="text-sm text-gray-400">
                        {portfolio.positions.length} {portfolio.positions.length === 1 ? 'posición' : 'posiciones'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddToPortfolio}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}
