import { useState, useEffect } from 'react'
import { getStockQuote } from '@/services/marketDataService'
import { getMarketNews } from '@/services/newsService'
import { getWeeklyRecommendations } from '@/services/aiAdvisorService'
import { StockData, NewsItem } from '@/types'
import Card from '@/components/ui/Card'
import InvestmentQuote from '@/components/ui/InvestmentQuote'
import ProgressBar from '@/components/ui/ProgressBar'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

interface Recommendation {
  ticker: string
  name: string
  action: 'buy' | 'sell' | 'hold'
  reason: string
  currentPrice: number
  type: 'stock' | 'etf' | 'bond'
}

interface WeeklyAnalysis {
  recommendations: Recommendation[]
  duplicateWarnings: string[]
  marketSummary: string
  generatedAt: string
}

export default function AIAdvisor() {
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have a recent analysis (less than 1 day old)
    const cached = localStorage.getItem('weekly_analysis')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const age = Date.now() - new Date(parsed.generatedAt).getTime()
        if (age < 24 * 60 * 60 * 1000) { // 24 hours
          setAnalysis(parsed)
          return
        }
      } catch (e) {
        console.error('Error parsing cached analysis:', e)
      }
    }
    
    // No valid cache, start analysis
    startAnalysis()
  }, [])

  async function startAnalysis() {
    setAnalyzing(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 800)

      // Get market data
      const popularStockTickers = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'TSLA', 'AMZN', 
                                   'JPM', 'BAC', 'JNJ', 'UNH', 'XOM', 'CVX', 'WMT', 'HD']
      const etfTickers = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'DIA', 'EEM', 'GLD']
      const bondTickers = ['TLT', 'IEF', 'SHY', 'AGG', 'BND', 'LQD', 'HYG', 'MUB']
      
      const allTickers = [...popularStockTickers, ...etfTickers, ...bondTickers]
      
      // Fetch stock data
      const stockDataPromises = allTickers.map(ticker => getStockQuote(ticker))
      const stocksData = (await Promise.all(stockDataPromises)).filter((s): s is StockData => s !== null)
      
      // Fetch news
      const news = await getMarketNews()
      
      // Get AI recommendations
      const result = await getWeeklyRecommendations(stocksData, news)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      // Save to cache
      const analysisData: WeeklyAnalysis = {
        ...result,
        generatedAt: new Date().toISOString()
      }
      localStorage.setItem('weekly_analysis', JSON.stringify(analysisData))
      
      setTimeout(() => {
        setAnalysis(analysisData)
        setAnalyzing(false)
      }, 500)
      
    } catch (err: any) {
      console.error('Error generating analysis:', err)
      setError(err.message || 'Error al generar el análisis')
      setAnalyzing(false)
    }
  }

  const buyRecommendations = analysis?.recommendations.filter(r => r.action === 'buy') || []
  const sellRecommendations = analysis?.recommendations.filter(r => r.action === 'sell') || []
  const holdRecommendations = analysis?.recommendations.filter(r => r.action === 'hold') || []

  if (analyzing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Asesor IA</h1>
          <p className="text-gray-400 mt-1">Recomendaciones semanales basadas en análisis de mercado</p>
        </div>

        <InvestmentQuote />

        <Card>
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Analizando el mercado</h2>
              <p className="text-gray-400">Procesando datos históricos, noticias y tendencias para generar tu proyección semanal</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <ProgressBar 
                progress={progress} 
                message="Analizando los datos para darte una proyección para la siguiente semana"
              />
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>• Analizando {40} instrumentos financieros</p>
              <p>• Procesando noticias recientes del mercado</p>
              <p>• Evaluando tendencias y patrones históricos</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Asesor IA</h1>
          <p className="text-gray-400 mt-1">Recomendaciones semanales basadas en análisis de mercado</p>
        </div>

        <Card>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Error al generar análisis</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={startAnalysis}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Reintentar análisis
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Asesor IA</h1>
          <p className="text-gray-400 mt-1">Recomendaciones semanales basadas en análisis de mercado</p>
        </div>
        <button
          onClick={startAnalysis}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Actualizar análisis
        </button>
      </div>

      {/* Market Summary */}
      <Card>
        <h2 className="text-xl font-bold mb-3">Resumen del Mercado</h2>
        <p className="text-gray-300 leading-relaxed">{analysis.marketSummary}</p>
        <p className="text-sm text-gray-500 mt-3">
          Análisis generado: {new Date(analysis.generatedAt).toLocaleString('es-ES', { 
            dateStyle: 'full', 
            timeStyle: 'short' 
          })}
        </p>
      </Card>

      {/* Duplicate Warnings */}
      {analysis.duplicateWarnings.length > 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-yellow-500 mb-2">⚠️ Advertencias de Duplicación</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                {analysis.duplicateWarnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Buy Recommendations */}
      {buyRecommendations.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Comprar</h2>
              <p className="text-sm text-gray-400">Oportunidades de inversión identificadas</p>
            </div>
          </div>
          <div className="space-y-3">
            {buyRecommendations.map((rec) => (
              <div key={rec.ticker} className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{rec.ticker}</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {rec.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{rec.name}</p>
                  </div>
                  <p className="text-lg font-bold text-green-400">${rec.currentPrice.toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-300">{rec.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sell Recommendations */}
      {sellRecommendations.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg">
              <TrendingDown className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Vender</h2>
              <p className="text-sm text-gray-400">Posiciones recomendadas para liquidar</p>
            </div>
          </div>
          <div className="space-y-3">
            {sellRecommendations.map((rec) => (
              <div key={rec.ticker} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{rec.ticker}</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {rec.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{rec.name}</p>
                  </div>
                  <p className="text-lg font-bold text-red-400">${rec.currentPrice.toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-300">{rec.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hold Recommendations */}
      {holdRecommendations.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg">
              <Minus className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Mantener</h2>
              <p className="text-sm text-gray-400">Posiciones estables para conservar</p>
            </div>
          </div>
          <div className="space-y-3">
            {holdRecommendations.map((rec) => (
              <div key={rec.ticker} className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{rec.ticker}</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {rec.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{rec.name}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-400">${rec.currentPrice.toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-300">{rec.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
