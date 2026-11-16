import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Target, BookOpen, Award, ChevronRight, HelpCircle, Zap, BarChart3, Brain, GitBranch, Map, ArrowUpRight, Clock } from 'lucide-react'
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  AnimatedCounter, StaggeredList, StaggerItem, StatusPulse,
} from '@/components/ui/motion'
import {
  TOPIC_COLORS, EVIDENCE_STATUS_COLORS, EVIDENCE_STATUS_LABELS,
  formatRelative, TOPIC_LABELS, DIFFICULTY_COLORS, getScoreColor,
} from '@/lib/utils'
import type { TopicPerformance, ConceptEvidence, PracticeRecommendation } from '@/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const { dashboardData, loadProfile, loadSessions, profile } = useAppStore()

  useEffect(() => {
    loadProfile()
    loadSessions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!dashboardData || dashboardData.totalSessions === 0) {
    return <EmptyDashboard name={profile?.name ?? 'there'} />
  }

  const d = dashboardData
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {greeting}, <span className="text-gradient">{profile?.name ?? 'Practitioner'}</span>
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <StatusPulse color="success" size="sm" />
            Interview readiness dashboard — data from {d.totalSessions} completed session{d.totalSessions !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => navigate('/interview/setup')}
          rightIcon={<ChevronRight />}
          className="hidden sm:flex shrink-0"
        >
          New Interview
        </Button>
      </div>

      {/* Top stat row */}
      <StaggeredList className="grid grid-cols-2 lg:grid-cols-4 gap-4" fast>
        <StaggerItem>
          <StatCard label="Readiness Score" value={d.readinessScore} suffix="/100" icon={<Award />} color="violet" tooltip={d.readinessExplanation} trend={d.readinessScore >= 70 ? 'up' : undefined} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Sessions Done" value={d.totalSessions} icon={<BookOpen />} color="blue" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Average Score" value={d.averageScore} suffix="%" icon={<BarChart3 />} color="green" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Concepts Shown" value={d.demonstratedConceptsCount} icon={<Brain />} color="amber" />
        </StaggerItem>
      </StaggeredList>

      {/* Main grid row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Readiness ring */}
        <Card className="flex flex-col items-center justify-center gap-5 py-8">
          <ScoreRing score={d.readinessScore} size="2xl" showGlow animated />
          <div className="text-center px-4 max-w-xs">
            <p className="text-sm font-semibold text-white mb-2">Interview Readiness</p>
            <p className="text-xs text-slate-500 leading-relaxed">{d.readinessExplanation}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/skill-dna')}
            rightIcon={<GitBranch />}
          >
            View Skill DNA
          </Button>
        </Card>

        {/* Score trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <Badge variant="default">{d.recentScoreTrend.length} sessions</Badge>
          </CardHeader>
          {d.recentScoreTrend.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center">
              <BarChart3 className="h-10 w-10 text-slate-700 mb-3" aria-hidden="true" />
              <p className="text-sm text-slate-500">Complete at least 2 sessions to see your trend</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={d.recentScoreTrend}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6d28d9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0a1020', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '12px' }}
                  formatter={(v: number) => [`${v}%`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#6d28d9" strokeWidth={2.5} fill="url(#scoreGradient)" dot={{ fill: '#6d28d9', r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Topic performance + radar */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Topic Performance</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/practice')} rightIcon={<ArrowUpRight />}>
              Practice
            </Button>
          </CardHeader>
          {d.topicPerformance.length === 0 ? (
            <p className="text-slate-500 text-sm py-6 text-center">No topic data yet.</p>
          ) : (
            <div className="space-y-4">
              {d.topicPerformance.map(t => <TopicRow key={t.topic} topic={t} />)}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Radar</CardTitle>
            <Badge variant="purple" size="sm">{d.topicPerformance.length} topics</Badge>
          </CardHeader>
          {d.topicPerformance.length < 3 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <GitBranch className="h-10 w-10 text-slate-700 mb-3" aria-hidden="true" />
              <p className="text-sm text-slate-500 max-w-[200px]">Practice 3+ topics to see the radar chart</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={d.topicPerformance.map(t => ({ subject: t.topicLabel.split(' ')[0], score: t.averageScore }))}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#6d28d9" fill="#6d28d9" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#0a1020', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '12px' }} formatter={(v: number) => [`${v}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Evidence map */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Evidence Map</CardTitle>
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success-500" />Demonstrated</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning-500" />Developing</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger-500" />Needs Practice</span>
          </div>
        </CardHeader>
        <p className="text-xs text-slate-600 mb-4">
          Demonstrated = avg ≥ 75% and ≥ 2 occurrences · Developing = avg ≥ 50% · Needs Practice = below that
        </p>
        {d.evidenceMap.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No concept data yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {d.evidenceMap.map(e => <EvidenceChip key={e.concept} evidence={e} />)}
          </div>
        )}
        {d.evidenceMap.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <Button variant="ghost" size="sm" onClick={() => navigate('/skill-dna')} leftIcon={<GitBranch />}>
              View full Skill DNA graph
            </Button>
          </div>
        )}
      </Card>

      {/* Recommendations + recent sessions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Practice</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/roadmap')} rightIcon={<Map />}>
              Roadmap
            </Button>
          </CardHeader>
          <div className="space-y-3">
            {d.recommendations.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">Complete more sessions to get recommendations.</p>
            ) : (
              d.recommendations.slice(0, 4).map(rec => (
                <RecommendationRow key={rec.id} rec={rec} onStart={() => navigate(`/interview/setup?topic=${rec.topic}`)} />
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')} rightIcon={<ChevronRight />}>
              All
            </Button>
          </CardHeader>
          <div className="space-y-2">
            {d.recentSessions.map(session => (
              <SessionRow
                key={session.id}
                session={session}
                onClick={() => navigate(`/history/${session.id}`)}
              />
            ))}
          </div>
        </Card>
      </div>

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, suffix, icon, color, tooltip, trend }: {
  label: string; value: number; suffix?: string; icon: React.ReactNode
  color: 'violet' | 'blue' | 'green' | 'amber'; tooltip?: string; trend?: 'up' | 'down'
}) {
  const colors = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    blue:   'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    green:  'text-success-400 bg-success-500/10 border-success-500/20',
    amber:  'text-warning-400 bg-warning-500/10 border-warning-500/20',
  }
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl border [&>svg]:h-5 [&>svg]:w-5 ${colors[color]}`}>{icon}</div>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-success-400" aria-hidden="true" />}
          {tooltip && (
            <button className="text-slate-700 hover:text-slate-400 transition-colors" title={tooltip} aria-label={`Info: ${tooltip}`}>
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="text-2xl font-bold text-white num">
        <AnimatedCounter value={value} suffix={suffix ?? ''} duration={1000} />
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </Card>
  )
}

function TopicRow({ topic }: { topic: TopicPerformance }) {
  const color = TOPIC_COLORS[topic.topic]
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="text-sm text-slate-300 w-32 shrink-0 truncate">{topic.topicLabel}</span>
      <div className="flex-1">
        <ProgressBar value={topic.averageScore} color="auto" size="sm" glow animated />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right num">{topic.averageScore}%</span>
      <Badge variant={topic.evidenceStatus === 'demonstrated' ? 'success' : topic.evidenceStatus === 'developing' ? 'warning' : 'danger'} size="sm">
        {topic.sessionsCount}×
      </Badge>
    </div>
  )
}

function EvidenceChip({ evidence }: { evidence: ConceptEvidence }) {
  const colorClass = EVIDENCE_STATUS_COLORS[evidence.status]
  const label = EVIDENCE_STATUS_LABELS[evidence.status]
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border cursor-default ${colorClass}`}
      title={`${label} — avg ${evidence.averageScore}% across ${evidence.occurrences} occurrence(s)`}
      aria-label={`${evidence.concept}: ${label}, average score ${evidence.averageScore}%`}
    >
      {evidence.concept}
      <span className="opacity-50">·{evidence.averageScore}%</span>
    </motion.span>
  )
}

function RecommendationRow({ rec, onStart }: { rec: PracticeRecommendation; onStart: () => void }) {
  const priorityColors = { 1: 'text-danger-400', 2: 'text-warning-400', 3: 'text-indigo-400' }
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
      <Target className={`h-4 w-4 mt-0.5 shrink-0 ${priorityColors[rec.priority]}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{rec.concept} — {rec.topicLabel}</p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{rec.reason}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
          <Clock className="h-3 w-3" aria-hidden="true" />
          ~{rec.estimatedMinutes} min
        </div>
      </div>
      <Button variant="ghost" size="xs" onClick={onStart} aria-label={`Start drill for ${rec.concept}`}>
        <Zap className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function SessionRow({ session, onClick }: { session: import('@/types').InterviewSession; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors text-left group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{TOPIC_LABELS[session.topic]}</span>
          <Badge variant="default" size="sm" className={DIFFICULTY_COLORS[session.difficulty]}>{session.difficulty}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {session.completedAt ? formatRelative(session.completedAt) : 'In progress'}
        </p>
      </div>
      {session.overallScore !== null && (
        <span className={`text-sm font-bold num ${getScoreColor(session.overallScore)}`}>{session.overallScore}%</span>
      )}
      <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" aria-hidden="true" />
    </button>
  )
}

// ─── Empty dashboard ──────────────────────────────────────────────────────────
function EmptyDashboard({ name }: { name: string }) {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 mx-auto mb-8"
        >
          <Award className="h-12 w-12 text-violet-400" aria-hidden="true" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome, <span className="text-gradient">{name}</span>
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed max-w-md mx-auto">
          Your readiness dashboard comes to life after your first session. Start practicing to build your Interview Evidence Portfolio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button size="lg" onClick={() => navigate('/interview/setup')} rightIcon={<ChevronRight />} glow>
            Start First Interview
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/practice')}>
            Browse Topics
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { icon: Brain, label: 'AI Feedback', desc: 'Instant evaluation' },
            { icon: Award, label: 'Evidence',    desc: 'Track your skills'  },
            { icon: TrendingUp, label: 'Progress', desc: 'Watch growth'    },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
