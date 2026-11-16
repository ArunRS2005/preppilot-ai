import { create } from 'zustand'
import type {
  UserProfile,
  InterviewSession,
  DashboardData,
  TopicPerformance,
  ConceptEvidence,
  PracticeRecommendation,
} from '@/types'
import {
  getLocalProfile,
  updateLocalProfile,
  getLocalSessions,
  saveLocalSession,
  deleteLocalSession,
} from '@/lib/localStorage'
import {
  buildTopicPerformance,
  buildConceptEvidence,
  calcReadinessScore,
  sessionsToScoreTrend,
} from '@/lib/utils'

interface AppState {
  // Profile
  profile: UserProfile | null
  loadProfile: () => void
  updateProfile: (updates: Partial<UserProfile>) => void

  // Sessions
  sessions: InterviewSession[]
  loadSessions: () => void
  saveSession: (session: InterviewSession) => void
  removeSession: (id: string) => void
  getSession: (id: string) => InterviewSession | undefined

  // Active interview
  activeSession: InterviewSession | null
  setActiveSession: (session: InterviewSession | null) => void

  // Dashboard
  dashboardData: DashboardData | null
  computeDashboard: () => void

  // Backend mode
  useLocalMode: boolean
  setUseLocalMode: (val: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // ─── Profile ───────────────────────────────────────────────────────────────
  profile: null,

  loadProfile() {
    const profile = getLocalProfile()
    set({ profile })
  },

  updateProfile(updates) {
    const profile = updateLocalProfile(updates)
    set({ profile })
    get().computeDashboard()
  },

  // ─── Sessions ──────────────────────────────────────────────────────────────
  sessions: [],

  loadSessions() {
    const sessions = getLocalSessions()
    set({ sessions })
    get().computeDashboard()
  },

  saveSession(session) {
    saveLocalSession(session)
    const sessions = getLocalSessions()
    set({ sessions })
    get().computeDashboard()
  },

  removeSession(id) {
    deleteLocalSession(id)
    const sessions = getLocalSessions()
    set({ sessions })
    get().computeDashboard()
  },

  getSession(id) {
    return get().sessions.find(s => s.id === id)
  },

  // ─── Active interview ──────────────────────────────────────────────────────
  activeSession: null,
  setActiveSession: session => set({ activeSession: session }),

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  dashboardData: null,

  computeDashboard() {
    const { sessions, profile } = get()
    if (!profile) return

    const completedSessions = sessions.filter(s => s.status === 'completed')
    const topicPerformance: TopicPerformance[] = buildTopicPerformance(completedSessions)
    const evidenceMap: ConceptEvidence[] = buildConceptEvidence(completedSessions)
    const { score: readinessScore, explanation: readinessExplanation } =
      calcReadinessScore(topicPerformance)

    const allScores = completedSessions
      .map(s => s.overallScore)
      .filter((s): s is number => s !== null)

    const averageScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0

    const recentSessions = [...completedSessions]
      .sort((a, b) =>
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime()
      )
      .slice(0, 5)

    const recommendations: PracticeRecommendation[] = buildRecommendations(
      topicPerformance,
      evidenceMap
    )

    const dashboardData: DashboardData = {
      readinessScore,
      readinessExplanation,
      totalSessions: completedSessions.length,
      averageScore,
      recentScoreTrend: sessionsToScoreTrend(completedSessions),
      topicPerformance,
      evidenceMap,
      demonstratedConceptsCount: evidenceMap.filter(e => e.status === 'demonstrated').length,
      needsPracticeConceptsCount: evidenceMap.filter(e => e.status === 'needs_practice').length,
      recommendations,
      recentSessions,
    }

    set({ dashboardData })
  },

  // ─── Mode ──────────────────────────────────────────────────────────────────
  useLocalMode: true,
  setUseLocalMode: val => set({ useLocalMode: val }),
}))

// ─── Recommendation builder ──────────────────────────────────────────────────
function buildRecommendations(
  topicPerf: TopicPerformance[],
  evidence: ConceptEvidence[]
): PracticeRecommendation[] {
  const recs: PracticeRecommendation[] = []

  // Recommend weakest topics not yet practiced
  const allTopics = ['java', 'dsa', 'dbms', 'os', 'networks', 'behavioral'] as const
  const practicedTopics = new Set(topicPerf.map(t => t.topic))

  for (const topic of allTopics) {
    if (!practicedTopics.has(topic)) {
      recs.push({
        id: `rec-unpracticed-${topic}`,
        concept: 'All concepts',
        topic,
        topicLabel: topic.toUpperCase(),
        reason: 'You haven\'t practiced this topic yet. Start here to improve topic coverage.',
        priority: 1,
        estimatedMinutes: 15,
        completed: false,
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Recommend weakest practiced topics
  const weakTopics = topicPerf
    .filter(t => t.averageScore < 60)
    .sort((a, b) => a.averageScore - b.averageScore)

  for (const topic of weakTopics.slice(0, 3)) {
    recs.push({
      id: `rec-weak-${topic.topic}`,
      concept: 'Core concepts',
      topic: topic.topic,
      topicLabel: topic.topicLabel,
      reason: `Your average score in ${topic.topicLabel} is ${topic.averageScore}%. Targeted practice can improve it.`,
      priority: 2,
      estimatedMinutes: 20,
      completed: false,
      createdAt: new Date().toISOString(),
    })
  }

  // Recommend concepts needing practice
  const needsPractice = evidence
    .filter(e => e.status === 'needs_practice')
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3)

  for (const concept of needsPractice) {
    recs.push({
      id: `rec-concept-${concept.concept}`,
      concept: concept.concept,
      topic: concept.topic,
      topicLabel: concept.topic.toUpperCase(),
      reason: `"${concept.concept}" scored ${concept.averageScore}% on average. Strengthen this concept.`,
      priority: 3,
      estimatedMinutes: 10,
      completed: false,
      createdAt: new Date().toISOString(),
    })
  }

  return recs.slice(0, 5)
}
