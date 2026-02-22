import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
  animated?: boolean
  glow?: boolean
  className?: string
}

export default function Badge({ 
  children, 
  variant = 'neutral',
  animated = false,
  glow = false,
  className = '' 
}: BadgeProps) {
  const variants = {
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    danger: 'bg-red-500/20 text-red-400 border-red-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }

  const glowVariants = {
    success: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    danger: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    warning: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    info: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    neutral: 'shadow-[0_0_15px_rgba(107,114,128,0.3)]'
  }

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${variants[variant]}
        ${animated ? 'animate-pulse' : ''}
        ${glow ? glowVariants[variant] : ''}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
