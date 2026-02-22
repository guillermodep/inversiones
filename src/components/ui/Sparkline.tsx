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
  const strokeColor = color || (trend >= 0 ? '#10b981' : '#ef4444')

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      style={{ display: 'block' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
