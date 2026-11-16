import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
  xl: 'h-16 w-16 border-4',
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)} role="status">
      <div
        className={cn(
          'animate-spin rounded-full border-violet-500/30 border-t-violet-500',
          sizes[size]
        )}
        aria-hidden="true"
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
      <span className="sr-only">{label ?? 'Loading…'}</span>
    </div>
  )
}

interface PageLoadingProps {
  label?: string
}

export function PageLoading({ label = 'Loading…' }: PageLoadingProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  )
}
