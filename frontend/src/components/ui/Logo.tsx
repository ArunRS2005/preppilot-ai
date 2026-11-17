/**
 * PrepPilot AI — Logo component
 * Uses the official SVG logo assets from /public/
 * Maintains original proportions at all sizes.
 * Includes purple glow and hover animation.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

// ─── Size configs ─────────────────────────────────────────────────────────────

const ICON_SIZES = {
  xs:  { px: 24, cls: 'h-6 w-6' },
  sm:  { px: 32, cls: 'h-8 w-8' },
  md:  { px: 40, cls: 'h-10 w-10' },
  lg:  { px: 56, cls: 'h-14 w-14' },
  xl:  { px: 80, cls: 'h-20 w-20' },
  '2xl': { px: 120, cls: 'h-30 w-30' },
}

type IconSize = keyof typeof ICON_SIZES

// ─── Icon only ────────────────────────────────────────────────────────────────

interface LogoIconProps {
  size?: IconSize
  glow?: boolean
  hover?: boolean
  className?: string
}

export function LogoIcon({ size = 'md', glow = true, hover = true, className }: LogoIconProps) {
  const reduced = useReducedMotion()
  const { px, cls } = ICON_SIZES[size]

  const glowStyle = glow
    ? { filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) drop-shadow(0 0 16px rgba(109, 40, 217, 0.4))' }
    : {}

  return (
    <motion.div
      whileHover={hover && !reduced ? { scale: 1.08, filter: 'drop-shadow(0 0 14px rgba(139,92,246,0.8)) drop-shadow(0 0 28px rgba(109,40,217,0.5))' } : undefined}
      whileTap={hover && !reduced ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn('inline-flex items-center justify-center shrink-0', cls, className)}
      style={glowStyle}
    >
      <img
        src="/logo-icon.svg"
        alt="PrepPilot AI logo"
        width={px}
        height={px}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </motion.div>
  )
}

// ─── Full logo (icon + wordmark) ──────────────────────────────────────────────

interface LogoFullProps {
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  hover?: boolean
  className?: string
  iconOnly?: boolean     // show only the icon, hide text
}

const FULL_SIZES = {
  sm: { h: 32, iconPx: 28 },
  md: { h: 40, iconPx: 36 },
  lg: { h: 52, iconPx: 46 },
}

export function LogoFull({ size = 'md', glow = true, hover = true, className, iconOnly = false }: LogoFullProps) {
  const reduced = useReducedMotion()
  const { h, iconPx } = FULL_SIZES[size]

  const glowStyle = glow
    ? { filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))' }
    : {}

  if (iconOnly) {
    return (
      <motion.div
        whileHover={hover && !reduced ? { scale: 1.06 } : undefined}
        whileTap={hover && !reduced ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.2 }}
        className={cn('inline-flex items-center justify-center shrink-0', className)}
        style={{ ...glowStyle, width: iconPx, height: iconPx }}
      >
        <img src="/logo-icon.svg" alt="PrepPilot AI" width={iconPx} height={iconPx} className="object-contain" draggable={false} />
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={hover && !reduced ? { scale: 1.03 } : undefined}
      whileTap={hover && !reduced ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn('inline-flex items-center gap-2.5 shrink-0', className)}
    >
      <div style={{ ...glowStyle, width: iconPx, height: iconPx, flexShrink: 0 }}>
        <img
          src="/logo-icon.svg"
          alt=""
          aria-hidden="true"
          width={iconPx}
          height={iconPx}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className="font-bold tracking-tight text-white"
          style={{ fontSize: h * 0.55 }}
        >
          PrepPilot
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent ml-1">AI</span>
        </span>
        {size === 'lg' && (
          <span className="text-slate-500 tracking-widest uppercase" style={{ fontSize: h * 0.19 }}>
            Your AI Interview Intelligence System
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Logo as nav link ─────────────────────────────────────────────────────────

interface LogoLinkProps {
  size?: 'sm' | 'md' | 'lg'
  to?: string
  className?: string
  iconOnly?: boolean
}

export function LogoLink({ size = 'md', to = '/', className, iconOnly = false }: LogoLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 rounded-xl',
        className
      )}
      aria-label="PrepPilot AI — Go to home"
    >
      <LogoFull size={size} iconOnly={iconOnly} />
    </Link>
  )
}
