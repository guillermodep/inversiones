import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HistoricalData } from '@/types'
import { formatCurrency } from '@/utils/formatters'

interface StockChartProps {
  data: HistoricalData[]
  onPeriodChange: (period: string) => void
  currentPeriod: string
  loading?: boolean
}

const periods = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: 'YTD', value: 'YTD' },
  { label: '1Y', value: '1Y' },
  { label: '2Y', value: '2Y' },
  { label: '5Y', value: '5Y' },
  { label: '10Y', value: '10Y' },
  { label: 'ALL', value: 'ALL' },
]

export default function StockChart({ data, onPeriodChange, currentPeriod, loading }: StockChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (currentPeriod === '1D') {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm text-gray-400">{new Date(payload[0].payload.date).toLocaleDateString('es-ES')}</p>
          <p className="text-lg font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const minPrice = Math.min(...data.map(d => d.close))
  const maxPrice = Math.max(...data.map(d => d.close))
  const priceChange = data.length > 1 ? data[data.length - 1].close - data[0].close : 0
  const percentChange = data.length > 1 && data[0].close > 0 
    ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100 
    : 0
  const isPositive = priceChange >= 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-1 mb-4">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              currentPeriod === period.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            disabled={loading}
          >
            {period.label}
          </button>
        ))}
      </div>

      {!loading && data.length > 1 && (
        <div className="text-center mb-2">
          <span className={`text-2xl font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
          </span>
          <span className="text-gray-400 text-sm ml-2">
            ({currentPeriod})
          </span>
        </div>
      )}

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-400">
          No hay datos disponibles para este período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6B7280"
              style={{ fontSize: '11px' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minPrice * 0.995, maxPrice * 1.005]}
              tickFormatter={(value) => `${value.toFixed(2)}`}
              stroke="#6B7280"
              style={{ fontSize: '11px' }}
              axisLine={false}
              tickLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth={2}
              fill="url(#colorPrice)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
