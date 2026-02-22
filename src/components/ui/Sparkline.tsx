interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export default function Sparkline({ 
  data, 
  width = 60, 
  height = 20,
  color,
  className = '' 
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={className} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  // Determine color based on trend
  const trend = data[data.length - 1] - data[0]
  const isPositive = trend >= 0
  const strokeColor = color || (isPositive ? '#10b981' : '#ef4444')
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`

  // Create area path
  const areaPoints = `${points} ${width},${height} 0,${height}`

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
