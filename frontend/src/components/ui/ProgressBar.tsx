import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'violet' | 'success' | 'warning' | 'danger' | 'cyan' | 'indigo' | 'auto'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
  showLabel?: boolean
  label?: string
  glow?: boolean
}

function getAutoColor(value: number): string {
  if (value >= 75) return 'bg-success-500'
  if (value >= 50) return 'bg-warning-500'
  return 'bg-danger-500'
}

function getAutoGlow(value: number): string {
  if (value >= 75) return 'shadow-[0_0_10px_rgba(16,185,129,0.4)]'
  if (value >= 50) return 'shadow-[0_0_10px_rgba(245,158,11,0.4)]'
  return 'shadow-[0_0_10px_rgba(239,68,68,0.3)]'
}

const colorMap: Record<string, string> = {
  violet: 'bg-violet-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
}

const glowMap: Record<string, string> = {
  violet: 'shadow-[0_0_10px_rgba(109,40,217,0.5)]',
  success: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
  warning: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
  danger:  'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
  cyan:    'shadow-[0_0_10px_rgba(6,182,212,0.4)]',
  indigo:  'shadow-[0_0_10px_rgba(99,102,241,0.4)]',
}

const sizeMap = {
  xs: 'h-0.5',
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'auto',
  size = 'md',
  animated = true,
  className,
  showLabel = false,
  label,
  glow = false,
}: ProgressBarProps) {
  const reduced = useReducedMotion()
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const barColor = color === 'auto' ? getAutoColor(pct) : colorMap[color]
  const glowClass = glow
    ? (color === 'auto' ? getAutoGlow(pct) : glowMap[color] ?? '')
    : ''

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showLabel && (
            <span className="text-xs font-medium text-slate-300 ml-auto">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full rounded-full bg-white/[0.06] overflow-hidden relative', sizeMap[size])}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {reduced || !animated ? (
          <div
            className={cn('h-full rounded-full', barColor, glowClass)}
            style={{ width: `${pct}%` }}
          />
        ) : (
          <motion.div
            className={cn('h-full rounded-full', barColor, glowClass)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </div>
    </div>
  )
}
