import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { buildPortfolioWithAI } from '@/services/llmService'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Sparkles } from 'lucide-react'
import { hasLLMConfig } from '@/config/env'

export default function PortfolioBuilder() {
  const { addPortfolio } = useStore()
  const [step, setStep] = useState(1)
  const [budget, setBudget] = useState('')
  const [horizon, setHorizon] = useState('')
  const [risk, setRisk] = useState('')
  const [sectors, setSectors] = useState<string[]>([])
  const [suggestedPortfolio, setSuggestedPortfolio] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const sectorOptions = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial']

  function toggleSector(sector: string) {
    setSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    )
  }

  async function handleGenerate() {
    if (!hasLLMConfig()) {
      alert('Configura tu API key de LLM en Configuración')
      return
    }

    setLoading(true)
    try {
      const result = await buildPortfolioWithAI(
        parseFloat(budget),
        horizon,
        risk,
        sectors
      )
      setSuggestedPortfolio(result)
      setStep(3)
    } catch (error) {
      console.error('Error building portfolio:', error)
      alert('Error al generar portfolio. Verifica tu API key.')
    } finally {
      setLoading(false)
    }
  }

  function handleAccept() {
    if (!suggestedPortfolio) return
    const positions = suggestedPortfolio.portfolio.map((item: any) => ({
      ticker: item.ticker,
      shares: item.shares,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    }))

    const newPortfolio = {
      id: Date.now().toString(),
      name: `Portfolio IA - ${new Date().toLocaleDateString()}`,
      type: 'long-term' as const,
      positions,
      createdAt: new Date().toISOString(),
    }
    addPortfolio(newPortfolio)
    alert('Portfolio creado exitosamente')
    setStep(1)
    setSuggestedPortfolio(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Constructor de Portfolio con IA</h1>
        <p className="text-gray-400 mt-1">Crea un portfolio personalizado con ayuda de IA</p>
      </div>

      {step === 1 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Paso 1: Información Básica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Presupuesto (USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="10000"
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
            <Button onClick={() => setStep(2)} disabled={!budget || !horizon || !risk}>
              Siguiente
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Paso 2: Sectores de Interés</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {sectorOptions.map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`p-3 rounded-lg border transition-colors ${
                  sectors.includes(sector)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-border hover:border-gray-600'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerate} disabled={loading || sectors.length === 0}>
              <Sparkles size={18} className="mr-2" />
              {loading ? 'Generando...' : 'Generar Portfolio'}
            </Button>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Atrás
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && suggestedPortfolio && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Portfolio Sugerido</h2>
          <div className="space-y-4">
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-gray-400">Estrategia</p>
              <p className="text-gray-300 mt-1">{suggestedPortfolio.strategy}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-border">
                    <th className="py-2 px-4">Ticker</th>
                    <th className="py-2 px-4">Nombre</th>
                    <th className="py-2 px-4 text-right">Asignación %</th>
                    <th className="py-2 px-4">Razón</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestedPortfolio.portfolio.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-border">
                      <td className="py-3 px-4 font-medium">{item.ticker}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4 text-right">{item.allocation}%</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAccept}>Aceptar y Crear Portfolio</Button>
              <Button variant="secondary" onClick={() => setStep(2)}>
                Regenerar
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
