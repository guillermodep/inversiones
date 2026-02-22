import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { getMarketIndices } from '@/services/marketDataService'
import { getMarketNews } from '@/services/newsService'
import { StockData, NewsItem } from '@/types'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { TrendingUp, TrendingDown, Newspaper, AlertTriangle } from 'lucide-react'
import { hasLLMConfig } from '@/config/env'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { portfolios } = useStore()
  const [indices, setIndices] = useState<StockData[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      const [indicesData, newsData] = await Promise.all([
        getMarketIndices(),
        getMarketNews(),
      ])
      setIndices(indicesData)
      setNews(newsData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen de mercado y tus inversiones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((index) => (
          <Card key={index.ticker}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{index.ticker}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(index.price)}</p>
              </div>
              {index.change >= 0 ? (
                <TrendingUp className="text-profit" size={32} />
              ) : (
                <TrendingDown className="text-loss" size={32} />
              )}
            </div>
            <p
              className={`text-sm mt-2 ${
                index.change >= 0 ? 'text-profit' : 'text-loss'
              }`}
            >
              {formatPercent(index.changePercent)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Tus Portfolios</h2>
          {portfolios.length === 0 ? (
            <p className="text-gray-400">No tienes portfolios creados aún.</p>
          ) : (
            <div className="space-y-3">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{portfolio.name}</p>
                      <p className="text-sm text-gray-400">
                        {portfolio.positions.length} posiciones
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Tipo</p>
                      <p className="text-sm font-medium capitalize">{portfolio.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={20} />
            <h2 className="text-xl font-bold">Noticias del Mercado</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {news.slice(0, 10).map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-background rounded-lg border border-border hover:border-blue-500 transition-colors"
              >
                <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{item.source}</p>
              </a>
            ))}
          </div>
        </Card>
      </div>

      {!hasLLMConfig() && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-1" size={24} />
            <div>
              <p className="font-medium text-yellow-500 mb-1">
                ⚠️ No has configurado tus API keys
              </p>
              <p className="text-sm text-yellow-400">
                Ve a <Link to="/settings" className="underline hover:text-yellow-300">Configuración</Link> para agregar tus claves y desbloquear todas las funcionalidades.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
