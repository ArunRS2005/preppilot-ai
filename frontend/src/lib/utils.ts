import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type {
  Difficulty,
  EvidenceStatus,
  InterviewType,
  TopicKey,
  TopicPerformance,
  ConceptEvidence,
  InterviewSession,
  ScoreTrendPoint,
  InterviewerPersonality,
  PersonalityConfig,
} from '@/types'

// ─── Personality configs ──────────────────────────────────────────────────────

export const PERSONALITY_CONFIGS: Record<InterviewerPersonality, PersonalityConfig> = {
  friendly_mentor: {
    id: 'friendly_mentor',
    name: 'Friendly Mentor',
    description: 'Supportive, explains concepts, encourages you to think aloud.',
    tone: 'warm and encouraging',
    icon: '🤝',
    color: '#10b981',
    traits: ['Supportive', 'Explanatory', 'Patient'],
  },
  strict_technical: {
    id: 'strict_technical',
    name: 'Strict Technical',
    description: 'Expects precise answers, asks for complexity analysis, no hand-holding.',
    tone: 'direct and exacting',
    icon: '🔬',
    color: '#6366f1',
    traits: ['Precise', 'Demanding', 'Detail-oriented'],
  },
  senior_engineer: {
    id: 'senior_engineer',
    name: 'Senior Engineer',
    description: 'Asks deeper engineering questions, trade-offs, and real-world scenarios.',
    tone: 'inquisitive and experienced',
    icon: '⚙️',
    color: '#8b5cf6',
    traits: ['Deep dives', 'Trade-offs', 'Pragmatic'],
  },
  stress_interviewer: {
    id: 'stress_interviewer',
    name: 'Stress Interviewer',
    description: 'Challenges weak assumptions and pushes on incomplete answers. Professional but firm.',
    tone: 'challenging but professional',
    icon: '⚡',
    color: '#f59e0b',
    traits: ['Challenging', 'Fast-paced', 'Assumption-tester'],
  },
  engineering_manager: {
    id: 'engineering_manager',
    name: 'Engineering Manager',
    description: 'Focuses on ownership, communication, and reasoning — not just technical details.',
    tone: 'strategic and leadership-focused',
    icon: '🎯',
    color: '#06b6d4',
    traits: ['Ownership', 'Communication', 'Leadership'],
  },
}

// ─── Tailwind class utility ───────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Topic labels ─────────────────────────────────────────────────────────────
export const TOPIC_LABELS: Record<TopicKey, string> = {
  java: 'Java',
  dsa: 'Data Structures & Algorithms',
  dbms: 'Database Management',
  os: 'Operating Systems',
  networks: 'Computer Networks',
  behavioral: 'HR & Behavioral',
}

export const TOPIC_COLORS: Record<TopicKey, string> = {
  java: '#f59e0b',
  dsa: '#8b5cf6',
  dbms: '#10b981',
  os: '#3b82f6',
  networks: '#ec4899',
  behavioral: '#06b6d4',
}

// ─── Difficulty labels ────────────────────────────────────────────────────────
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'text-success-400 bg-success-500/10 border-success-500/20',
  medium: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
  hard: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
}

// ─── Interview type labels ────────────────────────────────────────────────────
export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  mixed: 'Mixed',
}

// ─── Evidence status ──────────────────────────────────────────────────────────
export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  demonstrated: 'Demonstrated',
  developing: 'Developing',
  needs_practice: 'Needs Practice',
}

export const EVIDENCE_STATUS_COLORS: Record<EvidenceStatus, string> = {
  demonstrated: 'text-success-400 bg-success-500/10 border-success-500/20',
  developing: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
  needs_practice: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
}

// ─── Score utilities ──────────────────────────────────────────────────────────
export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-success-400'
  if (score >= 50) return 'text-warning-400'
  return 'text-danger-400'
}

export function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-success-500'
  if (score >= 50) return 'bg-warning-500'
  return 'bg-danger-500'
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  if (score >= 40) return 'Needs Work'
  return 'Poor'
}

// ─── Evidence calculation ─────────────────────────────────────────────────────
// Thresholds: demonstrated = avg >= 75 and count >= 2; developing = avg >= 50
export function calcEvidenceStatus(avgScore: number, occurrences: number): EvidenceStatus {
  if (avgScore >= 75 && occurrences >= 2) return 'demonstrated'
  if (avgScore >= 50) return 'developing'
  return 'needs_practice'
}

// ─── Readiness score calculation ──────────────────────────────────────────────
// Transparent formula explained in UI:
//   topic_score    = average evaluation scores per topic
//   coverage_bonus = (topics_practiced / 6) * 20   (max 20 points)
//   readiness      = min(100, weighted_avg(topic_scores) * 0.8 + coverage_bonus)
export function calcReadinessScore(topicPerformance: TopicPerformance[]): {
  score: number
  explanation: string
} {
  if (topicPerformance.length === 0) {
    return { score: 0, explanation: 'No sessions completed yet. Start practicing to build your readiness score.' }
  }

  const totalTopics = 6
  const practisedTopics = topicPerformance.filter(t => t.sessionsCount > 0)
  const avgTopicScore =
    practisedTopics.reduce((sum, t) => sum + t.averageScore, 0) / practisedTopics.length
  const coverageBonus = (practisedTopics.length / totalTopics) * 20
  const score = Math.min(100, Math.round(avgTopicScore * 0.8 + coverageBonus))

  const explanation =
    `Score = avg topic score (${Math.round(avgTopicScore)}) × 0.8 ` +
    `+ coverage bonus (${Math.round(coverageBonus)} pts from ${practisedTopics.length}/${totalTopics} topics practiced). ` +
    `Increase it by practicing more topics and improving your evaluation scores.`

  return { score, explanation }
}

// ─── Session → score trend ────────────────────────────────────────────────────
export function sessionsToScoreTrend(sessions: InterviewSession[]): ScoreTrendPoint[] {
  return sessions
    .filter(s => s.status === 'completed' && s.overallScore !== null)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
    .slice(-12) // last 12 sessions
    .map(s => ({
      date: format(parseISO(s.completedAt!), 'MMM d'),
      score: s.overallScore!,
      sessionId: s.id,
      topic: TOPIC_LABELS[s.topic],
    }))
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy')
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

// ─── ID generation ────────────────────────────────────────────────────────────
export function generateId(): string {
  return crypto.randomUUID()
}

// ─── Concept evidence from sessions ──────────────────────────────────────────
export function buildConceptEvidence(sessions: InterviewSession[]): ConceptEvidence[] {
  const conceptMap = new Map<
    string,
    { topic: TopicKey; scores: number[]; lastSeen: string }
  >()

  for (const session of sessions) {
    if (session.status !== 'completed') continue
    for (const sq of session.questions) {
      if (!sq.evaluation) continue
      const ev = sq.evaluation
      for (const concept of ev.demonstratedConcepts) {
        const key = concept.toLowerCase()
        const existing = conceptMap.get(key)
        if (existing) {
          existing.scores.push(ev.overallScore)
          if (new Date(session.completedAt!) > new Date(existing.lastSeen)) {
            existing.lastSeen = session.completedAt!
          }
        } else {
          conceptMap.set(key, {
            topic: session.topic,
            scores: [ev.overallScore],
            lastSeen: session.completedAt ?? new Date().toISOString(),
          })
        }
      }
    }
  }

  return Array.from(conceptMap.entries()).map(([concept, data]) => {
    const avg = data.scores.reduce((s, x) => s + x, 0) / data.scores.length
    return {
      concept,
      topic: data.topic,
      status: calcEvidenceStatus(avg, data.scores.length),
      averageScore: Math.round(avg),
      occurrences: data.scores.length,
      lastSeen: data.lastSeen,
    }
  })
}

// ─── Topic performance from sessions ─────────────────────────────────────────
export function buildTopicPerformance(sessions: InterviewSession[]): TopicPerformance[] {
  const topicMap = new Map<
    TopicKey,
    { scores: number[]; questionsAnswered: number }
  >()

  for (const session of sessions) {
    if (session.status !== 'completed') continue
    const existing = topicMap.get(session.topic) ?? { scores: [], questionsAnswered: 0 }
    if (session.overallScore !== null) {
      existing.scores.push(session.overallScore)
    }
    existing.questionsAnswered += session.questions.filter(q => q.answer !== null).length
    topicMap.set(session.topic, existing)
  }

  return Array.from(topicMap.entries()).map(([topic, data]) => {
    const avg =
      data.scores.length > 0
        ? Math.round(data.scores.reduce((s, x) => s + x, 0) / data.scores.length)
        : 0
    return {
      topic,
      topicLabel: TOPIC_LABELS[topic],
      averageScore: avg,
      sessionsCount: data.scores.length,
      questionsAnswered: data.questionsAnswered,
      evidenceStatus: calcEvidenceStatus(avg, data.scores.length),
    }
  })
}
