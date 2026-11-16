/**
 * Framer Motion wrapper components and animation presets.
 * All respect prefers-reduced-motion automatically via Framer's built-in hook.
 */

import { motion, useReducedMotion, type Variants, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Animation variant presets ────────────────────────────────────────────────

export const variants = {
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  } satisfies Variants,

  slideUp: {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  } satisfies Variants,

  slideDown: {
    hidden:  { opacity: 0, y: -12 },
    visible: { opacity: 1, y:   0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  } satisfies Variants,

  scaleIn: {
    hidden:  { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1,   transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
  } satisfies Variants,

  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  } satisfies Variants,

  staggerFast: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0 } },
  } satisfies Variants,

  itemSlideUp: {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  } satisfies Variants,

  pageEnter: {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
  } satisfies Variants,
} as const

// ─── Page transition wrapper ──────────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants.pageEnter}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Staggered list ───────────────────────────────────────────────────────────

interface StaggeredListProps {
  children: React.ReactNode
  className?: string
  fast?: boolean
  delay?: number
}

export function StaggeredList({ children, className, fast = false, delay = 0 }: StaggeredListProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  const v = fast ? variants.staggerFast : variants.stagger
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        ...v,
        visible: { ...v.visible, transition: { ...((v.visible as { transition?: object }).transition ?? {}), delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger child item ───────────────────────────────────────────────────────

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div variants={variants.itemSlideUp} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Fade in on scroll ────────────────────────────────────────────────────────

export function FadeInView({
  children,
  className,
  delay = 0,
  once = true,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  once?: boolean
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-64px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Hover card with tilt effect ─────────────────────────────────────────────

export function HoverCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <div className={cn('transition-shadow hover:shadow-card-hover', className)} onClick={onClick}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 48px rgba(0,0,0,0.6)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  decimals?: number
}

export function AnimatedCounter({
  value,
  duration = 1200,
  suffix = '',
  prefix = '',
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(0)
  const reduced = useReducedMotion()
  const prevRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) {
      setDisplayed(value)
      return
    }

    const start = prevRef.current
    const end = value
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = start + (end - start) * eased
      setDisplayed(parseFloat(current.toFixed(decimals)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = end
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration, reduced, decimals])

  return (
    <span className={className}>
      {prefix}{displayed.toFixed(decimals)}{suffix}
    </span>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

export function Skeleton({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded-lg"
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-white/[0.05] bg-navy-800/60 p-5', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 rounded w-2/3" />
          <div className="skeleton h-3 rounded w-1/3" />
        </div>
      </div>
      <div className="skeleton h-20 rounded-xl" />
    </div>
  )
}

// ─── Glow pulse indicator ─────────────────────────────────────────────────────

export function StatusPulse({
  color = 'violet',
  size = 'md',
}: {
  color?: 'violet' | 'success' | 'warning' | 'danger' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
}) {
  const colors = {
    violet:  'bg-violet-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger:  'bg-danger-500',
    cyan:    'bg-cyan-500',
  }
  const sizes = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2', lg: 'h-2.5 w-2.5' }

  return (
    <span className="relative flex shrink-0">
      <span className={cn('animate-ping-slow absolute inline-flex rounded-full opacity-75', sizes[size], colors[color])} />
      <span className={cn('relative inline-flex rounded-full', sizes[size], colors[color])} />
    </span>
  )
}

// ─── Gradient border card ─────────────────────────────────────────────────────

export function GlowCard({
  children,
  className,
  glowColor = 'violet',
  hover = true,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  glowColor?: 'violet' | 'cyan' | 'indigo' | 'success' | 'warning'
  hover?: boolean
  onClick?: () => void
}) {
  const glows = {
    violet: 'hover:shadow-glow-sm hover:border-violet-500/30',
    cyan:   'hover:shadow-glow-cyan hover:border-cyan-500/30',
    indigo: 'hover:shadow-glow-indigo hover:border-indigo-500/30',
    success:'hover:border-success-500/30',
    warning:'hover:border-warning-500/30',
  }

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={hover && onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-navy-800/70 backdrop-blur-sm shadow-card',
        'bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,rgba(109,40,217,0.06),transparent)]',
        'transition-all duration-300',
        hover && glows[glowColor],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// ─── Typewriter text ──────────────────────────────────────────────────────────

export function Typewriter({
  texts,
  speed = 60,
  pause = 2000,
  className,
}: {
  texts: string[]
  speed?: number
  pause?: number
  className?: string
}) {
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const current = texts[textIdx]
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed

    const t = setTimeout(() => {
      if (!deleting && charIdx === current.length) {
        setDeleting(true)
      } else if (deleting && charIdx === 0) {
        setDeleting(false)
        setTextIdx(i => (i + 1) % texts.length)
      } else {
        setCharIdx(i => i + (deleting ? -1 : 1))
      }
    }, delay)
    return () => clearTimeout(t)
  }, [charIdx, deleting, textIdx, texts, speed, pause, reduced])

  const current = reduced ? texts[0] : texts[textIdx].slice(0, charIdx)

  return (
    <span className={className}>
      {current}
      {!reduced && (
        <span className="animate-blink border-r-2 border-violet-400 ml-0.5">&nbsp;</span>
      )}
    </span>
  )
}

// ─── Re-export AnimatePresence for use in pages ────────────────────────────────
export { AnimatePresence, motion }
