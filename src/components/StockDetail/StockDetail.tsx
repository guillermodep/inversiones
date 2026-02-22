import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getStockQuote, getHistoricalData, getFundamentals } from '@/services/marketDataService'
import { getStockNews } from '@/services/newsService'
import { analyzeStock } from '@/services/llmService'
import { StockData, HistoricalData, NewsItem, FundamentalData, LLMRecommendation } from '@/types'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import StockChart from '@/components/StockChart/StockChart'
import { formatCurrency, formatPercent, formatLargeNumber } from '@/utils/formatters'
import { hasLLMConfig } from '@/config/env'

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>()
  const [stock, setStock] = useState<StockData | null>(null)
  const [historical, setHistorical] = useState<HistoricalData[]>([])
  const [fundamentals, setFundamentals] = useState<FundamentalData | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [recommendation, setRecommendation] = useState<LLMRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [chartPeriod, setChartPeriod] = useState('3M')
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    if (ticker) {
      loadStockData()
      
      // Auto-refresh stock data every 60 seconds
      const interval = setInterval(() => {
        refreshStockPrice()
      }, 60000) // 60 seconds
      
      return () => clearInterval(interval)
    }
  }, [ticker])

  useEffect(() => {
    if (stock && historical.length > 0 && news.length > 0 && hasLLMConfig() && !recommendation && !analyzing) {
      handleAnalyze()
    }
  }, [stock, historical, news])

  async function refreshStockPrice() {
    if (!ticker) return
    try {
      const stockData = await getStockQuote(ticker)
      setStock(stockData)
      console.log(`🔄 Stock price refreshed for ${ticker}`)
    } catch (error) {
      console.error('Error refreshing stock price:', error)
    }
  }

  async function loadStockData() {
    if (!ticker) return
    setLoading(true)
    try {
      const [stockData, historicalData, fundamentalsData, newsData] = await Promise.all([
        getStockQuote(ticker),
        getHistoricalData(ticker, chartPeriod),
        getFundamentals(ticker),
        getStockNews(ticker),
      ])
      setStock(stockData)
      setHistorical(historicalData)
      setFundamentals(fundamentalsData)
      setNews(newsData)
    } catch (error) {
      console.error('Error loading stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePeriodChange(period: string) {
    if (!ticker) return
    setChartPeriod(period)
    setChartLoading(true)
    try {
      const historicalData = await getHistoricalData(ticker, period)
      setHistorical(historicalData)
    } catch (error) {
      console.error('Error loading historical data:', error)
    } finally {
      setChartLoading(false)
    }
  }

  async function handleAnalyze() {
    if (!stock || !hasLLMConfig()) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const result = await analyzeStock({
        ticker: ticker!,
        historicalData: historical,
        news,
        fundamentals,
        currentPrice: stock.price,
      })
      setRecommendation(result)
    } catch (error: any) {
      console.error('Error analyzing stock:', error)
      const errorMessage = error.message || 'Error desconocido al analizar'
      setAnalysisError(errorMessage)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <Loading />
  if (!stock) return <div>No se encontró la acción</div>

  return (
    <div className="space-y-6">
      {analyzing && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <div>
            <p className="font-medium">Analizando {stock.ticker} con IA...</p>
            <p className="text-sm text-blue-100">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}

      {analysisError && !analyzing && (
        <div className="bg-red-900/20 border border-red-600 text-white px-4 py-3 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-red-400">Error al analizar con IA</p>
              <p className="text-sm text-red-300 mt-1">{analysisError}</p>
              <p className="text-xs text-red-400 mt-2">Esto puede deberse a límite de tokens o problemas de conexión</p>
            </div>
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Reintentar análisis
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{stock.ticker}</h1>
          <p className="text-gray-400 mt-1">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{formatCurrency(stock.price)}</p>
          <p className={`text-lg ${stock.change >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatPercent(stock.changePercent)}
          </p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <p className="text-sm text-gray-400">Open</p>
            <p className="text-lg font-medium">{stock.open ? formatCurrency(stock.open) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">High</p>
            <p className="text-lg font-medium">{stock.high ? formatCurrency(stock.high) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Low</p>
            <p className="text-lg font-medium">{stock.low ? formatCurrency(stock.low) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Vol</p>
            <p className="text-lg font-medium">{formatLargeNumber(stock.volume)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">P/E</p>
            <p className="text-lg font-medium">{stock.peRatio?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Mkt Cap</p>
            <p className="text-lg font-medium">{stock.marketCap ? formatLargeNumber(stock.marketCap) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">52W H</p>
            <p className="text-lg font-medium">{stock.fiftyTwoWeekHigh ? formatCurrency(stock.fiftyTwoWeekHigh) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">52W L</p>
            <p className="text-lg font-medium">{stock.fiftyTwoWeekLow ? formatCurrency(stock.fiftyTwoWeekLow) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avg Vol</p>
            <p className="text-lg font-medium">{stock.avgVolume ? formatLargeNumber(stock.avgVolume) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Yield</p>
            <p className="text-lg font-medium">{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Beta</p>
            <p className="text-lg font-medium">{stock.beta?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">EPS</p>
            <p className="text-lg font-medium">{stock.eps?.toFixed(2) || 'N/A'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Gráfico de Precio</h2>
        <StockChart
          data={historical}
          onPeriodChange={handlePeriodChange}
          currentPeriod={chartPeriod}
          loading={chartLoading}
        />
      </Card>

      {fundamentals && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Datos Fundamentales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">EPS</p>
              <p className="text-lg font-medium">{fundamentals.eps?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenue</p>
              <p className="text-lg font-medium">
                {fundamentals.revenue ? formatLargeNumber(fundamentals.revenue) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Debt/Equity</p>
              <p className="text-lg font-medium">{fundamentals.debtToEquity?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Dividend Yield</p>
              <p className="text-lg font-medium">{fundamentals.dividendYield?.toFixed(2) || 'N/A'}%</p>
            </div>
          </div>
        </Card>
      )}

      {!hasLLMConfig() && (
        <Card>
          <p className="text-yellow-500">
            Configura Azure OpenAI en tu archivo .env para obtener análisis automático con IA
          </p>
        </Card>
      )}

      {recommendation && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Análisis con IA</h2>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400">Recomendación</p>
                <p className={`text-2xl font-bold ${
                  recommendation.recommendation === 'COMPRAR' ? 'text-profit' :
                  recommendation.recommendation === 'VENDER' ? 'text-loss' : 'text-yellow-500'
                }`}>
                  {recommendation.recommendation}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Confianza</p>
                <p className="text-xl font-medium">{recommendation.confidence}</p>
              </div>
              {recommendation.targetPrice30Days && (
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Precio Objetivo (30d)</p>
                  <p className="text-xl font-medium">{formatCurrency(recommendation.targetPrice30Days)}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Análisis</p>
              <p className="text-gray-300">{recommendation.analysis}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Razones Principales</p>
              <ul className="list-disc list-inside space-y-1">
                {recommendation.reasons.map((reason, idx) => (
                  <li key={idx} className="text-gray-300">{reason}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Riesgos a Considerar</p>
              <ul className="list-disc list-inside space-y-1">
                {recommendation.risks.map((risk, idx) => (
                  <li key={idx} className="text-gray-300">{risk}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <p className="text-sm text-yellow-500">
                ⚠️ Esta es una recomendación orientativa generada por IA, no constituye asesoramiento financiero.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-xl font-bold mb-4">Noticias Recientes</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {news.slice(0, 20).map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-background rounded-lg border border-border hover:border-blue-500 transition-colors"
            >
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-gray-400 mt-1">{item.source}</p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}
