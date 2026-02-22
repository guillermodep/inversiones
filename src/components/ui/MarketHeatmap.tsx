import { useNavigate } from 'react-router-dom'

interface HeatmapItem {
  ticker: string
  name: string
  change: number
  changePercent: number
  price: number
  category: 'stock' | 'etf' | 'bond'
}

interface MarketHeatmapProps {
  items: HeatmapItem[]
  title?: string
}

export default function MarketHeatmap({ items, title = "Market Overview" }: MarketHeatmapProps) {
  const navigate = useNavigate()

  const getColorClass = (changePercent: number) => {
    if (changePercent >= 2) return 'bg-green-600 hover:bg-green-500'
    if (changePercent >= 1) return 'bg-green-500 hover:bg-green-400'
    if (changePercent >= 0) return 'bg-green-400 hover:bg-green-300'
    if (changePercent >= -1) return 'bg-red-400 hover:bg-red-300'
    if (changePercent >= -2) return 'bg-red-500 hover:bg-red-400'
    return 'bg-red-600 hover:bg-red-500'
  }

  const getTextColorClass = (changePercent: number) => {
    return Math.abs(changePercent) >= 1 ? 'text-white' : 'text-gray-900'
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'stock': return '📈'
      case 'etf': return '📊'
      case 'bond': return '💰'
      default: return ''
    }
  }

  // Sort by absolute change to show most volatile first
  const sortedItems = [...items].sort((a, b) => 
    Math.abs(b.changePercent) - Math.abs(a.changePercent)
  )

  return (
    <div className="space-y-3">
      {title && <h3 className="text-lg font-semibold text-gray-300">{title}</h3>}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {sortedItems.map((item) => (
          <button
            key={item.ticker}
            onClick={() => navigate(`/stock/${item.ticker}`)}
            className={`
              ${getColorClass(item.changePercent)}
              ${getTextColorClass(item.changePercent)}
              p-3 rounded-lg transition-all duration-200
              flex flex-col items-start justify-between
              min-h-[100px] relative overflow-hidden
              group
            `}
          >
            {/* Category badge */}
            <span className="absolute top-1 right-1 text-xs opacity-70">
              {getCategoryLabel(item.category)}
            </span>

            {/* Ticker */}
            <div className="font-bold text-sm mb-1">{item.ticker}</div>

            {/* Change percentage - large */}
            <div className="text-2xl font-bold mb-1">
              {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
            </div>

            {/* Name - truncated */}
            <div className="text-xs opacity-80 truncate w-full text-left">
              {item.name}
            </div>

            {/* Hover overlay with more info */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-center items-center text-white">
              <div className="font-bold text-lg mb-1">{item.ticker}</div>
              <div className="text-sm mb-2 text-center">{item.name}</div>
              <div className="text-xl font-bold mb-1">
                ${item.price.toFixed(2)}
              </div>
              <div className="text-lg font-semibold">
                {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
              </div>
              <div className="text-sm opacity-80">
                ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
