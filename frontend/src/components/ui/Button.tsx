import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'cyan'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  glow?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 ' +
    'text-white border border-violet-500/40 hover:border-violet-400/60 shadow-button-glow hover:shadow-glow',
  secondary:
    'bg-navy-700/80 hover:bg-navy-600/80 text-violet-300 hover:text-violet-200 ' +
    'border border-violet-500/20 hover:border-violet-500/40 backdrop-blur-sm',
  ghost:
    'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white border border-transparent hover:border-white/10',
  danger:
    'bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 hover:text-danger-300 ' +
    'border border-danger-500/20 hover:border-danger-500/40',
  outline:
    'bg-transparent hover:bg-violet-500/10 text-violet-400 hover:text-violet-300 ' +
    'border border-violet-500/40 hover:border-violet-500/70',
  cyan:
    'bg-gradient-to-br from-cyan-600/80 to-indigo-600/80 hover:from-cyan-500/80 hover:to-indigo-500/80 ' +
    'text-white border border-cyan-500/40 hover:border-cyan-400/60 shadow-glow-cyan',
}

const sizes: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1',
  sm: 'px-3.5 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-4.5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
}

const MotionButton = motion.button

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, glow, className, children, disabled, ...props }, ref) => {
    const reduced = useReducedMotion()

    const cls = cn(
      'inline-flex items-center justify-center font-semibold transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      glow && 'shadow-glow',
      className
    )

    const motionProps = reduced ? {} : {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.97 },
      transition: { duration: 0.15 },
    }

    return (
      <MotionButton
        ref={ref}
        disabled={disabled || loading}
        className={cls}
        {...motionProps}
        {...(props as React.ComponentProps<typeof MotionButton>)}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon ? (
          <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{rightIcon}</span>
        ) : null}
      </MotionButton>
    )
  }
)
Button.displayName = 'Button'
