/**
 * Weakness-to-Mastery Roadmap
 * Personalized learning path generated from missing concepts in evaluations.
 * All data is derived from stored sessions — no fabricated content.
 */

import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Map as MapIcon, CheckCircle, Circle, Zap, ArrowRight, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { FadeInView, StaggeredList, StaggerItem, AnimatedCounter } from '@/components/ui/motion'
import { TOPIC_LABELS, TOPIC_COLORS, buildConceptEvidence, buildTopicPerformance } from '@/lib/utils'
import type { TopicKey } from '@/types'

interface RoadmapMilestone {
  id: string
  concept: string
  topic: TopicKey
  topicLabel: string
  status: 'completed' | 'active' | 'upcoming'
  currentScore: number
  targetScore: number
  sessions: number
  reason: string
  estimatedMinutes: number
  order: number
}

function buildRoadmap(
  sessions: import('@/types').InterviewSession[]
): RoadmapMilestone[] {
  const completed = sessions.filter(s => s.status === 'completed')
  const evidence = buildConceptEvidence(completed)
  buildTopicPerformance(completed) // used for future extensions

  const milestones: RoadmapMilestone[] = []
  let order = 0

  // 1. Missing concepts from evaluations (highest priority)
  const missingConceptMap = new globalThis.Map<string, { topic: TopicKey; count: number }>()
  for (const session of completed) {
    for (const sq of session.questions) {
      if (!sq.evaluation) continue
      for (const concept of sq.evaluation.missingConcepts) {
        const key = concept.toLowerCase()
        const existing = missingConceptMap.get(key)
        if (existing) { existing.count++ }
        else { missingConceptMap.set(key, { topic: session.topic, count: 1 }) }
      }
    }
  }

  // 2. Concepts that are needs_practice
  const needsPractice = evidence.filter(e => e.status === 'needs_practice')
  const developing = evidence.filter(e => e.status === 'developing')

  // Build milestones for missing concepts
  for (const [concept, data] of Array.from(missingConceptMap.entries()).slice(0, 5) as Array<[string, { topic: TopicKey; count: number }]>) {
    milestones.push({
      id: `missing-${concept}`,
      concept,
      topic: data.topic,
      topicLabel: TOPIC_LABELS[data.topic],
      status: 'active',
      currentScore: 0,
      targetScore: 75,
      sessions: 0,
      reason: `Missing from ${data.count} evaluated answer${data.count > 1 ? 's' : ''}`,
      estimatedMinutes: 15,
      order: order++,
    })
  }

  // Needs practice concepts
  for (const e of needsPractice.sort((a, b) => a.averageScore - b.averageScore).slice(0, 5)) {
    if (milestones.some(m => m.concept === e.concept)) continue
    milestones.push({
      id: `needs-${e.concept}`,
      concept: e.concept,
      topic: e.topic,
      topicLabel: TOPIC_LABELS[e.topic],
      status: 'active',
      currentScore: e.averageScore,
      targetScore: 75,
      sessions: e.occurrences,
      reason: `Avg ${e.averageScore}% across ${e.occurrences} session${e.occurrences > 1 ? 's' : ''} — below target`,
      estimatedMinutes: 20,
      order: order++,
    })
  }

  // Developing concepts
  for (const e of developing.sort((a, b) => a.averageScore - b.averageScore).slice(0, 4)) {
    milestones.push({
      id: `dev-${e.concept}`,
      concept: e.concept,
      topic: e.topic,
      topicLabel: TOPIC_LABELS[e.topic],
      status: 'upcoming',
      currentScore: e.averageScore,
      targetScore: 85,
      sessions: e.occurrences,
      reason: `${e.averageScore}% average — strengthen to fully demonstrate`,
      estimatedMinutes: 15,
      order: order++,
    })
  }

  // Demonstrated concepts (completed milestones)
  const demonstrated = evidence.filter(e => e.status === 'demonstrated').slice(0, 5)
  for (const e of demonstrated) {
    milestones.push({
      id: `done-${e.concept}`,
      concept: e.concept,
      topic: e.topic,
      topicLabel: TOPIC_LABELS[e.topic],
      status: 'completed',
      currentScore: e.averageScore,
      targetScore: 75,
      sessions: e.occurrences,
      reason: `Consistently demonstrated across ${e.occurrences} session${e.occurrences > 1 ? 's' : ''}`,
      estimatedMinutes: 0,
      order: order++,
    })
  }

  return milestones.sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, completed: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
    return a.order - b.order
  })
}

export function RoadmapPage() {
  const navigate = useNavigate()
  const { sessions, loadSessions, loadProfile } = useAppStore()

  useEffect(() => { loadProfile(); loadSessions() }, []) // eslint-disable-line

  const milestones = useMemo(() => buildRoadmap(sessions), [sessions])

  const completed = milestones.filter(m => m.status === 'completed').length
  const total = milestones.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  if (sessions.filter(s => s.status === 'completed').length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<MapIcon className="h-8 w-8" />}
          title="Complete sessions to build your Roadmap"
          description="Your personalized learning roadmap is generated from missing concepts and weak areas in your evaluations."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeInView className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapIcon className="h-5 w-5 text-violet-400" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-white">Weakness-to-Mastery Roadmap</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-lg">
              Generated from your evaluation data. Each milestone is a concept to strengthen, derived from missing or low-scoring answers.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/interview/setup')} rightIcon={<Zap />}>
            Practice Now
          </Button>
        </div>

        {/* Overall progress */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Overall Progress</p>
              <p className="text-xs text-slate-500">
                <AnimatedCounter value={completed} className="text-white font-semibold" /> of {total} milestones reached
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gradient num">
                <AnimatedCounter value={progress} suffix="%" duration={1000} />
              </p>
            </div>
          </div>
          <ProgressBar value={progress} color="violet" size="lg" glow animated />
        </Card>
      </FadeInView>

      {/* Category legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Circle className="h-3.5 w-3.5 text-danger-400 fill-danger-400/20" />Active — needs work now</span>
        <span className="flex items-center gap-1.5"><Circle className="h-3.5 w-3.5 text-warning-400 fill-warning-400/20" />Upcoming — strengthen further</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success-400" />Completed — consistently demonstrated</span>
      </div>

      {/* Milestones */}
      <StaggeredList className="space-y-3">
        {milestones.map((m, i) => (
          <StaggerItem key={m.id}>
            <MilestoneCard milestone={m} index={i} onPractice={() => navigate(`/interview/setup?topic=${m.topic}`)} />
          </StaggerItem>
        ))}
      </StaggeredList>

      {milestones.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No roadmap items generated yet. Complete more sessions with detailed evaluations.</p>
        </div>
      )}
    </div>
  )
}

function MilestoneCard({ milestone: m, index, onPractice }: {
  milestone: RoadmapMilestone
  index: number
  onPractice: () => void
}) {
  const statusConfig = {
    completed: { icon: CheckCircle, iconColor: 'text-success-400', border: 'border-success-500/20', bg: 'bg-success-500/5' },
    active:    { icon: Circle,      iconColor: 'text-danger-400',  border: 'border-danger-500/20',  bg: 'bg-danger-500/5' },
    upcoming:  { icon: Circle,      iconColor: 'text-warning-400', border: 'border-warning-500/20', bg: 'bg-warning-500/5' },
  }
  const { icon: Icon, iconColor, border, bg } = statusConfig[m.status]
  const topicColor = TOPIC_COLORS[m.topic]

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-2xl border ${border} ${bg} flex items-start gap-4`}
    >
      {/* Number + icon */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="text-xs text-slate-600 font-mono">#{index + 1}</div>
        <Icon className={`h-5 w-5 ${iconColor}`} aria-label={m.status} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-white capitalize">{m.concept}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-md" style={{ color: topicColor, backgroundColor: `${topicColor}15` }}>
                {m.topicLabel}
              </span>
              {m.status !== 'completed' && m.estimatedMinutes > 0 && (
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />~{m.estimatedMinutes} min
                </span>
              )}
            </div>
          </div>
          {m.status !== 'completed' && (
            <Button variant="ghost" size="xs" onClick={onPractice} rightIcon={<ArrowRight />}>
              Practice
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-2">{m.reason}</p>

        {/* Progress bar */}
        {m.status !== 'completed' && m.currentScore > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Current: {m.currentScore}%</span>
              <span>Target: {m.targetScore}%</span>
            </div>
            <ProgressBar value={m.currentScore} max={m.targetScore} color="auto" size="sm" animated />
          </div>
        )}

        {m.status === 'completed' && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-success-400">
            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Demonstrated at {m.currentScore}% average across {m.sessions} session{m.sessions > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </motion.div>
  )
}
