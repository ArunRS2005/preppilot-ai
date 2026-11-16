import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Dark foundation ──────────────────────────────────────────────────
        navy: {
          950: '#03050e',
          900: '#060a16',
          800: '#0a1020',
          700: '#0f172e',
          600: '#162040',
          500: '#1e2d55',
        },
        // ── Primary accent — electric violet ─────────────────────────────────
        violet: {
          950: '#1a0840',
          900: '#270d5e',
          800: '#38148a',
          700: '#5018b8',
          600: '#6d28d9',
          500: '#7c3aed',
          400: '#8b5cf6',
          300: '#a78bfa',
          200: '#c4b5fd',
          100: '#ede9fe',
        },
        // ── Secondary accent — electric indigo ───────────────────────────────
        indigo: {
          600: '#4338ca',
          500: '#6366f1',
          400: '#818cf8',
          300: '#a5b4fc',
        },
        // ── Tertiary accent — electric cyan ──────────────────────────────────
        cyan: {
          600: '#0891b2',
          500: '#06b6d4',
          400: '#22d3ee',
          300: '#67e8f9',
        },
        // ── Status ───────────────────────────────────────────────────────────
        success: {
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
        },
        warning: {
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
          300: '#fcd34d',
        },
        danger: {
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171',
          300: '#fca5a5',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(109,40,217,0.35), transparent)',
        'card-glow': 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(109,40,217,0.07), transparent)',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E\")",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        'glow-violet': 'radial-gradient(circle at center, rgba(109,40,217,0.3) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(circle at center, rgba(6,182,212,0.25) 0%, transparent 70%)',
        'glow-indigo': 'radial-gradient(circle at center, rgba(99,102,241,0.25) 0%, transparent 70%)',
      },

      boxShadow: {
        'glow-xs':  '0 0 8px rgba(109,40,217,0.15)',
        'glow-sm':  '0 0 20px rgba(109,40,217,0.2)',
        'glow':     '0 0 40px rgba(109,40,217,0.25)',
        'glow-lg':  '0 0 70px rgba(109,40,217,0.3)',
        'glow-xl':  '0 0 100px rgba(109,40,217,0.35)',
        'glow-cyan': '0 0 30px rgba(6,182,212,0.25)',
        'glow-indigo': '0 0 30px rgba(99,102,241,0.25)',
        'card':       '0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover': '0 8px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.07) inset',
        'card-active':'0 2px 16px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset',
        'glass':      '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        'button-glow':'0 0 20px rgba(109,40,217,0.4), 0 4px 12px rgba(0,0,0,0.4)',
      },

      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'fade-in-slow':  'fadeIn 0.8s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-down':    'slideDown 0.3s ease-out',
        'slide-left':    'slideLeft 0.3s ease-out',
        'scale-in':      'scaleIn 0.3s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 10s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'spin-slow':     'spin 8s linear infinite',
        'orbit':         'orbit 12s linear infinite',
        'blink':         'blink 1.2s step-end infinite',
        'gradient-x':    'gradientX 4s ease infinite',
        'border-glow':   'borderGlow 3s ease-in-out infinite',
        'count-up':      'countUp 1s ease-out forwards',
        'wiggle':        'wiggle 0.3s ease-in-out',
        'ping-slow':     'ping 3s cubic-bezier(0,0,0.2,1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(16px)' },
          '50%': { opacity: '1', filter: 'blur(24px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gradientX: {
          '0%, 100%': { backgroundSize: '200% 200%', backgroundPosition: 'left center' },
          '50%': { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
        },
        borderGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(109,40,217,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(109,40,217,0.6)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
} satisfies Config
