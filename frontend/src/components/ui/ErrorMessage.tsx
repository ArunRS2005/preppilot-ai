import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  type?: 'error' | 'network' | 'warning'
  className?: string
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  type = 'error',
  className,
}: ErrorMessageProps) {
  const Icon = type === 'network' ? WifiOff : AlertTriangle
  const colorClass = type === 'warning' ? 'text-warning-400' : 'text-danger-400'
  const bgClass = type === 'warning' ? 'bg-warning-500/10 border-warning-500/20' : 'bg-danger-500/10 border-danger-500/20'

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-4 flex gap-3 items-start',
        bgClass,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', colorClass)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-white mb-0.5">{title}</p>}
        <p className="text-sm text-slate-300">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw />}
            className="mt-2 -ml-1"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
