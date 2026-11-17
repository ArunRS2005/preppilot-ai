import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { GitBranch, Map, Star, ArrowRight, Code2, Database, Cpu, Network, Heart, BarChart3,
         Zap, Brain, Target, TrendingUp, Shield, ChevronRight, CheckCircle, Layers, MessageSquare, Award, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LogoIcon } from '@/components/ui/Logo'
import {
  FadeInView, StaggeredList, StaggerItem, Typewriter, AnimatedCounter,
} from '@/components/ui/motion'

export function LandingPage() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()

  return (
    <div className="relative overflow-x-hidden bg-navy-950">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[96vh] flex items-center pt-20 pb-16"
        aria-labelledby="hero-heading"
      >
        {/* Ambient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px]
                          bg-gradient-radial from-violet-700/20 to-transparent rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px]
                          bg-gradient-radial from-indigo-600/12 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px]
                          bg-gradient-radial from-cyan-600/8 to-transparent rounded-full blur-[80px]" />
          {/* Grid */}
          <div className="absolute inset-0 grid-overlay opacity-60" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left col */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 32 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <Badge variant="purple" className="gap-2 py-1 px-3">
                  <LogoIcon size="xs" glow={false} hover={false} />
                  AI Interview Intelligence System
                </Badge>
                <span className="flex items-center gap-1 text-xs text-success-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success-500"></span>
                  </span>
                  Live
                </span>
              </div>

              <h1
                id="hero-heading"
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight"
              >
                <span className="text-gradient-white block">Your Personal</span>
                <span className="block mt-1">
                  <Typewriter
                    texts={['AI Interviewer.', 'Career Coach.', 'Skill Analyst.', 'Evidence Builder.']}
                    className="text-gradient"
                    speed={55}
                    pause={2200}
                  />
                </span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                Practice technical and behavioral interviews with live AI feedback, build an evidence portfolio of your skills, and understand exactly where you stand — before the real interview.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button
                  size="lg"
                  onClick={() => navigate('/interview/setup')}
                  rightIcon={<ChevronRight />}
                  glow
                >
                  Start Practicing Free
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  View Dashboard
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {['No account required', 'Gemini AI-powered', 'Free to start'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-success-400 shrink-0" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right col — interactive preview */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, x: 24 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block"
            >
              <HeroDashboardPreview />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <FadeInView>
        <section className="border-y border-white/[0.05] bg-navy-900/50 py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-gradient mb-1 num">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1800} />
                  </div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── TOPICS ────────────────────────────────────────────────────────── */}
      <FadeInView>
        <section className="py-16" aria-labelledby="topics-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p id="topics-heading" className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
              Practice across 6 topic areas
            </p>
            <StaggeredList className="grid grid-cols-3 sm:grid-cols-6 gap-3" fast>
              {TOPICS.map(topic => (
                <StaggerItem key={topic.id}>
                  <TopicPill {...topic} onClick={() => navigate(`/interview/setup?topic=${topic.id}`)} />
                </StaggerItem>
              ))}
            </StaggeredList>
          </div>
        </section>
      </FadeInView>

      {/* ── SIGNATURE FEATURES ─────────────────────────────────────────────── */}
      <section className="py-24" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-16">
            <Badge variant="purple" className="mb-4">What makes PrepPilot different</Badge>
            <h2 id="features-heading" className="text-4xl sm:text-5xl font-bold text-white mb-5">
              More than a question bank
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              PrepPilot builds a real picture of your interview readiness, not just a score.
            </p>
          </FadeInView>

          <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SIG_FEATURES.map(f => (
              <StaggerItem key={f.title}>
                <SignatureFeatureCard {...f} />
              </StaggerItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <FadeInView>
        <section className="py-24 border-t border-white/[0.05]" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="how-heading" className="text-4xl font-bold text-white mb-4">How PrepPilot works</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <FadeInView key={step.title} delay={i * 0.1}>
                  <StepCard step={i + 1} {...step} />
                </FadeInView>
              ))}
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <FadeInView>
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-3xl overflow-hidden border border-violet-500/20 p-12 sm:p-16 text-center">
              <div className="absolute inset-0 mesh-gradient" aria-hidden="true" />
              <div className="absolute inset-0 grid-overlay opacity-30" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex justify-center mb-5">
                  <LogoIcon size="lg" glow hover={false} />
                </div>
                <Badge variant="purple" className="mb-5 gap-1.5">
                  <Star className="h-3 w-3" />
                  Build your evidence portfolio today
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
                  Ready to ace your<br />
                  <span className="text-gradient">next interview?</span>
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg">
                  Practice sessions. Real AI feedback. Evidence that shows you've actually learned.
                </p>
                <Button
                  size="xl"
                  onClick={() => navigate('/interview/setup')}
                  rightIcon={<ArrowRight />}
                  glow
                >
                  Start Your First Session
                </Button>
              </div>
            </div>
          </div>
        </section>
      </FadeInView>
    </div>
  )
}

// ─── Hero dashboard preview ───────────────────────────────────────────────────
function HeroDashboardPreview() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      <div className="absolute -inset-8 bg-violet-600/8 rounded-3xl blur-2xl" aria-hidden="true" />
      <div className="relative rounded-2xl border border-white/10 bg-navy-800/90 backdrop-blur-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-navy-900/50">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-danger-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-success-500/70" />
          </div>
          <div className="flex items-center gap-1.5 mx-auto">
            <img src="/logo-icon.svg" alt="" aria-hidden="true" width={16} height={16} className="object-contain" />
            <span className="text-xs text-slate-500">PrepPilot AI — Dashboard</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Score + stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 flex flex-col items-center justify-center rounded-xl bg-navy-900/60 border border-white/[0.05] py-4">
              <div className="relative h-20 w-20" aria-hidden="true">
                <svg viewBox="0 0 80 80" className="rotate-[-90deg]">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="32" fill="none" stroke="#6d28d9" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray="201.1"
                    initial={{ strokeDashoffset: 201.1 }}
                    animate={{ strokeDashoffset: 60 }}
                    transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatedCounter value={72} className="text-xl font-bold text-white" duration={1500} />
                  <span className="text-[9px] text-violet-400 font-medium">Good</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Readiness</span>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2">
              {[{ label: 'Sessions', val: 14 }, { label: 'Avg Score', val: 76 }, { label: 'Concepts', val: 23 }, { label: 'Streak', val: 7 }].map(s => (
                <div key={s.label} className="rounded-xl bg-navy-900/60 border border-white/[0.05] p-3">
                  <AnimatedCounter value={s.val} className="text-lg font-bold text-white num" duration={1200} />
                  <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic bars */}
          <div className="rounded-xl bg-navy-900/60 border border-white/[0.05] p-3.5 space-y-2.5">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mb-2">Topic Performance</p>
            {[
              { label: 'Java', pct: 82, color: '#f59e0b' },
              { label: 'DSA',  pct: 68, color: '#8b5cf6' },
              { label: 'DBMS', pct: 75, color: '#10b981' },
              { label: 'OS',   pct: 55, color: '#6366f1' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2">
                <span className="w-8 text-[10px] text-slate-400 shrink-0">{t.label}</span>
                <div className="flex-1 h-1 rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: t.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="w-6 text-[10px] text-slate-500 text-right">{t.pct}</span>
              </div>
            ))}
          </div>

          {/* Evidence chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '12 Demonstrated', cls: 'bg-success-500/10 text-success-400 border-success-500/20' },
              { label: '6 Developing', cls: 'bg-warning-500/10 text-warning-400 border-warning-500/20' },
              { label: '3 Needs Practice', cls: 'bg-danger-500/10 text-danger-400 border-danger-500/20' },
            ].map(c => (
              <span key={c.label} className={`px-2 py-1 rounded-lg text-[10px] font-medium border ${c.cls}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Topic pill ───────────────────────────────────────────────────────────────
function TopicPill({ icon: Icon, label, color, onClick }: {
  icon: React.ElementType; label: string; color: string; id: string; onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-4 px-2 w-full rounded-2xl border border-white/[0.06]
                 bg-navy-800/60 hover:border-white/[0.12] hover:bg-navy-700/60 transition-colors"
      aria-label={`Practice ${label}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl"
           style={{ backgroundColor: `${color}18`, border: `1px solid ${color}25` }}>
        <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
      </div>
      <span className="text-xs text-slate-300 font-medium text-center leading-tight">{label}</span>
    </motion.button>
  )
}

// ─── Signature feature card ───────────────────────────────────────────────────
function SignatureFeatureCard({ icon: Icon, title, description, color, badge }: {
  icon: React.ElementType; title: string; description: string; color: string; badge?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 p-5 rounded-2xl border border-white/[0.06] bg-navy-800/60
                 hover:border-white/[0.1] hover:shadow-card-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl"
             style={{ backgroundColor: `${color}15`, border: `1px solid ${color}22` }}>
          <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
        </div>
        {badge && (
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl
                      bg-gradient-to-br from-violet-600/20 to-indigo-600/20
                      border border-violet-500/30 text-violet-300 font-bold text-xl">
        {step}
        <div className="absolute inset-0 rounded-2xl animate-border-glow opacity-50" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── Static data ──────────────────────────────────────────────────────────────
const STATS = [
  { value: 48,  suffix: '+',  label: 'Curated questions'   },
  { value: 6,   suffix: '',   label: 'Practice topics'      },
  { value: 100, suffix: '%',  label: 'AI-evaluated answers' },
  { value: 0,   suffix: '',   label: 'Account required'     },
]

const TOPICS = [
  { id: 'java',      icon: Code2,    label: 'Java',       color: '#f59e0b' },
  { id: 'dsa',       icon: BarChart3, label: 'DSA',       color: '#8b5cf6' },
  { id: 'dbms',      icon: Database,  label: 'DBMS',      color: '#10b981' },
  { id: 'os',        icon: Cpu,       label: 'OS',        color: '#6366f1' },
  { id: 'networks',  icon: Network,   label: 'Networks',  color: '#ec4899' },
  { id: 'behavioral',icon: Heart,     label: 'Behavioral',color: '#06b6d4' },
]

const SIG_FEATURES = [
  { icon: Brain,     title: 'Gemini AI Evaluation',      color: '#8b5cf6', badge: 'AI',
    description: 'Get scored on technical correctness, completeness, and clarity — not keyword matching. Each answer teaches you something specific.' },
  { icon: GitBranch, title: 'Skill DNA Graph',            color: '#06b6d4', badge: 'New',
    description: 'Interactive knowledge graph showing which concepts you\'ve demonstrated, developing, or need work — derived from real practice evidence.' },
  { icon: TrendingUp,title: 'Answer Evolution Tracker',   color: '#10b981',
    description: 'Compare your answers to the same question over time. See how your explanations improve with side-by-side diffs and score comparisons.' },
  { icon: Map,       title: 'Weakness-to-Mastery Roadmap', color: '#f59e0b', badge: 'New',
    description: 'Personalized learning path generated from your missing concepts. Milestone tracking with completed, active, and upcoming stages.' },
  { icon: Shield,    title: 'Interview Evidence Passport',color: '#6366f1',
    description: 'An exportable professional report of your demonstrated skills, topic performance, and practice history. Honest about what you\'ve built.' },
  { icon: Layers,    title: 'Interviewer Personalities',  color: '#ec4899', badge: 'New',
    description: 'Practice with 5 interviewer personas: Friendly Mentor, Strict Technical, Senior Engineer, Stress Interviewer, or Engineering Manager.' },
  { icon: Code2,     title: 'Engineering Lab',             color: '#8b5cf6', badge: 'New',
    description: 'Code editor for algorithm problems, debugging challenges with real bugs, and system design prompts with AI feedback on your approach.' },
  { icon: MessageSquare, title: 'Voice Practice', color: '#06b6d4', badge: 'New',
    description: 'Speak your answers aloud. Get pacing, filler word, and structure analysis — with technical correctness scored separately.' },
  { icon: FileText,  title: 'Resume Intelligence',         color: '#f59e0b', badge: 'New',
    description: 'Paste your resume and a job description. Match skills, find gaps, and generate targeted interview questions for the actual role.' },
  { icon: Target,    title: 'Targeted Practice Drills',   color: '#10b981',
    description: 'AI-recommended sessions focused on exactly your weakest topics and missing concepts — not random questions.' },
  { icon: Award,     title: 'Transparent Readiness Score', color: '#10b981',
    description: 'Your readiness score is calculated with a visible formula. No black box — understand exactly what moves your score and by how much.' },
  { icon: Zap,       title: '5 Interviewer Personalities', color: '#8b5cf6',
    description: 'Switch between supportive, demanding, and leadership-focused personas to prepare for different interview dynamics.' },
]

const STEPS = [
  { title: 'Configure your session', description: 'Choose role, topic, difficulty, interview type, and interviewer personality.' },
  { title: 'Answer the questions', description: 'Practice in a focused interface. Use voice or text. Take your time.' },
  { title: 'Get AI feedback', description: 'Receive scored evaluation: strengths, improvements, demonstrated concepts, missing concepts.' },
  { title: 'Track your evidence', description: 'Watch your readiness score, skill DNA, and answer evolution build over time.' },
]
