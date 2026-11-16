import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Zap, LayoutDashboard, History, Settings, Menu, X,
  ChevronRight, BookOpen, GitBranch, Map, Fingerprint, FlaskConical,
  Mic, FileText,
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { to: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { to: '/skill-dna',  label: 'Skill DNA',  icon: GitBranch      },
  { to: '/roadmap',    label: 'Roadmap',    icon: Map             },
  { to: '/practice',   label: 'Practice',   icon: BookOpen        },
  { to: '/lab',        label: 'Lab',        icon: FlaskConical    },
  { to: '/voice',      label: 'Voice',      icon: Mic             },
  { to: '/resume',     label: 'Resume AI',  icon: FileText        },
  { to: '/history',    label: 'History',    icon: History         },
  { to: '/passport',   label: 'Passport',   icon: Fingerprint     },
  { to: '/settings',   label: 'Settings',   icon: Settings        },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-navy-900/90 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-navy-900/60 backdrop-blur-sm border-b border-white/[0.04]'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl p-1 -m-1"
            aria-label="PrepPilot AI home"
          >
            <motion.div
              whileHover={reduced ? undefined : { scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 shadow-glow-sm"
            >
              <Zap className="h-4 w-4 text-white" aria-hidden="true" />
            </motion.div>
            <span className="text-sm font-bold tracking-tight">
              <span className="text-white">PrepPilot</span>
              <span className="text-gradient"> AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.slice(0, 6).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70',
                    isActive
                      ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors',
                  isActive && 'text-violet-300 bg-violet-500/10'
                )
              }
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </NavLink>
            <Button
              size="sm"
              onClick={() => navigate('/interview/setup')}
              rightIcon={<ChevronRight />}
            >
              Start Interview
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            onClick={() => setMobileOpen(v => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mobileOpen ? 'close' : 'open'}
                initial={reduced ? undefined : { rotate: -90, opacity: 0 }}
                animate={reduced ? undefined : { rotate: 0, opacity: 1 }}
                exit={reduced ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduced ? undefined : { opacity: 0, height: 0 }}
            animate={reduced ? undefined : { opacity: 1, height: 'auto' }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-white/[0.06] bg-navy-900/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-white/[0.06] mt-1">
                <Button
                  className="w-full"
                  onClick={() => navigate('/interview/setup')}
                  rightIcon={<ChevronRight />}
                >
                  Start Interview
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
