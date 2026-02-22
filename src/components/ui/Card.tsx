import { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6 backdrop-blur-md shadow-xl',
        'hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300',
        'hover-scale',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
