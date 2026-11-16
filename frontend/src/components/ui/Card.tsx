import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean | 'violet' | 'cyan' | 'indigo'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glass' | 'dark' | 'bordered'
}

const paddingSizes = {
  none: '',
  sm:   'p-4',
  md:   'p-5 md:p-6',
  lg:   'p-6 md:p-8',
  xl:   'p-8 md:p-10',
}

const glowStyles = {
  violet: 'shadow-glow-sm border-violet-500/20',
  cyan:   'shadow-glow-cyan border-cyan-500/20',
  indigo: 'shadow-glow-indigo border-indigo-500/20',
}

const cardVariants = {
  default:  'bg-navy-800/70 border-white/[0.06]',
  glass:    'bg-white/[0.04] border-white/[0.08] backdrop-blur-xl',
  dark:     'bg-navy-900/80 border-white/[0.05]',
  bordered: 'bg-navy-800/60 border-violet-500/20',
}

export function Card({
  glow = false,
  hover = false,
  padding = 'md',
  variant = 'default',
  className,
  children,
  onClick,
  ...props
}: CardProps) {
  const reduced = useReducedMotion()
  const glowClass = glow === true ? glowStyles.violet : glow ? glowStyles[glow] : ''

  const base = cn(
    'rounded-2xl border shadow-card',
    'bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,rgba(109,40,217,0.055),transparent)]',
    cardVariants[variant],
    hover && 'transition-all duration-300',
    hover && !reduced && 'hover:shadow-card-hover hover:border-white/[0.1]',
    glowClass,
    paddingSizes[padding],
    onClick && 'cursor-pointer',
    className
  )

  if (hover && !reduced) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2 }}
        className={base}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={base} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  size?: 'sm' | 'md' | 'lg'
}
export function CardTitle({ as: Tag = 'h3', size = 'md', className, children, ...props }: CardTitleProps) {
  const sizes = { sm: 'text-sm font-semibold', md: 'text-base font-semibold', lg: 'text-lg font-bold' }
  return (
    <Tag className={cn(sizes[size], 'text-white', className)} {...props}>
      {children}
    </Tag>
  )
}
