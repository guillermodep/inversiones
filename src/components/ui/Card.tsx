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
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
