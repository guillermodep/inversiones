import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function Screener() {
  const navigate = useNavigate()
  const [preset, setPreset] = useState('')

  const presets = [
    { id: 'value', name: 'Value Picks', description: 'P/E bajo, dividendos altos' },
    { id: 'momentum', name: 'Momentum', description: 'Tendencia alcista fuerte' },
    { id: 'dividend', name: 'High Dividend', description: 'Alto rendimiento de dividendos' },
    { id: 'growth', name: 'Growth', description: 'Alto crecimiento de ingresos' },
  ]

  const sampleResults = [
    { ticker: 'KO', name: 'Coca-Cola', pe: 24.5, dividend: 3.2, sector: 'Consumer' },
    { ticker: 'PG', name: 'Procter & Gamble', pe: 26.1, dividend: 2.5, sector: 'Consumer' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', pe: 15.8, dividend: 2.8, sector: 'Healthcare' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screener de Acciones</h1>
        <p className="text-gray-400 mt-1">Descubre oportunidades de inversión</p>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4">Estrategias Predefinidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`p-4 rounded-lg border transition-colors text-left ${
                preset === p.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-border hover:border-gray-600'
              }`}
            >
              <p className="font-bold">{p.name}</p>
              <p className="text-sm text-gray-400 mt-1">{p.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {preset && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Resultados</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Acción</th>
                  <th className="py-2 px-4">Sector</th>
                  <th className="py-2 px-4 text-right">P/E</th>
                  <th className="py-2 px-4 text-right">Dividend %</th>
                  <th className="py-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {sampleResults.map((stock) => (
                  <tr key={stock.ticker} className="border-b border-border">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{stock.ticker}</p>
                        <p className="text-sm text-gray-400">{stock.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{stock.sector}</td>
                    <td className="py-3 px-4 text-right">{stock.pe}</td>
                    <td className="py-3 px-4 text-right">{stock.dividend}%</td>
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
        </Card>
      )}
    </div>
  )
}
