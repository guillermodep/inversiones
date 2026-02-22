interface ProgressBarProps {
  progress: number // 0-100
  message?: string
  className?: string
}

export default function ProgressBar({ progress, message, className = '' }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{message}</span>
          <span className="text-blue-400 font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
