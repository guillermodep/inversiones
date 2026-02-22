import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { parseCSV } from '@/utils/excelParser'
import { extractPortfolioFromImage } from '@/services/llmService'
import { PortfolioPosition } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Upload as UploadIcon, FileText, Image } from 'lucide-react'
import { hasLLMConfig } from '@/config/env'

export default function Upload() {
  const { addPortfolio } = useStore()
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [loading, setLoading] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const parsed = await parseCSV(file)
        setPositions(parsed)
      } else {
        alert('Por favor sube un archivo CSV')
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error al procesar el archivo')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !hasLLMConfig()) return

    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result?.toString().split(',')[1]
        if (base64) {
          const extracted = await extractPortfolioFromImage(base64)
          setPositions(extracted)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error extracting from image:', error)
      alert('Error al extraer datos de la imagen')
    } finally {
      setLoading(false)
    }
  }

  function handleImport() {
    if (positions.length === 0) return
    const newPortfolio = {
      id: Date.now().toString(),
      name: `Portfolio Importado ${new Date().toLocaleDateString()}`,
      type: 'long-term' as const,
      positions,
      createdAt: new Date().toISOString(),
    }
    addPortfolio(newPortfolio)
    setPositions([])
    alert('Portfolio importado exitosamente')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar Tenencias</h1>
        <p className="text-gray-400 mt-1">Sube tus posiciones desde CSV o imagen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Subir CSV/Excel</h3>
            <p className="text-sm text-gray-400 mb-4">
              Formato: Ticker, Cantidad, Precio_Compra, Fecha
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
              <Button as="span" disabled={loading}>
                <UploadIcon size={18} className="mr-2" />
                {loading ? 'Procesando...' : 'Seleccionar Archivo'}
              </Button>
            </label>
          </div>
        </Card>

        <Card>
          <div className="text-center py-8">
            <Image size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Subir Imagen</h3>
            <p className="text-sm text-gray-400 mb-4">
              Captura de pantalla de tu broker
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading || !hasLLMConfig()}
              />
              <Button as="span" disabled={loading || !hasLLMConfig()}>
                <UploadIcon size={18} className="mr-2" />
                {loading ? 'Procesando...' : 'Seleccionar Imagen'}
              </Button>
            </label>
            {!hasLLMConfig() && (
              <p className="text-xs text-yellow-500 mt-2">
                Requiere API key de LLM configurada
              </p>
            )}
          </div>
        </Card>
      </div>

      {positions.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Posiciones Detectadas</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-border">
                  <th className="py-2 px-4">Ticker</th>
                  <th className="py-2 px-4 text-right">Acciones</th>
                  <th className="py-2 px-4 text-right">Precio Compra</th>
                  <th className="py-2 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-3 px-4 font-medium">{pos.ticker}</td>
                    <td className="py-3 px-4 text-right">{pos.shares}</td>
                    <td className="py-3 px-4 text-right">${pos.purchasePrice.toFixed(2)}</td>
                    <td className="py-3 px-4">{pos.purchaseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleImport}>Importar Portfolio</Button>
        </Card>
      )}
    </div>
  )
}
