import { motion, useReducedMotion } from 'framer-motion'
import { cn, getScoreLabel } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  label?: string
  showLabel?: boolean
  showGlow?: boolean
  animated?: boolean
  className?: string
}

const sizeConfig = {
  sm:  { vb: 60,  r: 22, sw: 4,   textSize: 11, labelSize: 8  },
  md:  { vb: 80,  r: 30, sw: 5,   textSize: 15, labelSize: 9  },
  lg:  { vb: 120, r: 46, sw: 7,   textSize: 24, labelSize: 10 },
  xl:  { vb: 160, r: 62, sw: 8,   textSize: 36, labelSize: 12 },
  '2xl': { vb: 200, r: 78, sw: 10, textSize: 48, labelSize: 14 },
}

function getColor(score: number): string {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function getGlowColor(score: number): string {
  if (score >= 75) return 'rgba(16,185,129,0.3)'
  if (score >= 50) return 'rgba(245,158,11,0.3)'
  return 'rgba(239,68,68,0.25)'
}

export function ScoreRing({
  score,
  size = 'lg',
  label,
  showLabel = true,
  showGlow = false,
  animated = true,
  className,
}: ScoreRingProps) {
  const { vb, r, sw, textSize, labelSize } = sizeConfig[size]
  const reduced = useReducedMotion()
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = getColor(score)
  const center = vb / 2

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={showGlow ? { filter: `drop-shadow(0 0 ${sw * 2}px ${getGlowColor(score)})` } : undefined}
    >
      <svg
        width={vb}
        height={vb}
        viewBox={`0 0 ${vb} ${vb}`}
        aria-label={`Score: ${score} out of 100`}
        role="img"
      >
        {/* Track ring */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={sw}
        />
        {/* Track ring inner glow */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={sw + 4}
        />
        {/* Progress arc */}
        {reduced || !animated ? (
          <circle
            cx={center} cy={center} r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : (
          <motion.circle
            cx={center} cy={center} r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
        {/* Score text */}
        <text
          x={center}
          y={center - (showLabel ? labelSize * 0.7 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontWeight="700"
          fontSize={textSize}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {score}
        </text>
        {/* Label text */}
        {showLabel && (
          <text
            x={center}
            y={center + textSize * 0.6 + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontWeight="500"
            fontSize={labelSize}
            fontFamily="Inter, system-ui, sans-serif"
          >
            {label ?? getScoreLabel(score)}
          </text>
        )}
      </svg>
    </div>
  )
}
