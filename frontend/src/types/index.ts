// ─── Interviewer personality ──────────────────────────────────────────────────

export type InterviewerPersonality =
  | 'friendly_mentor'
  | 'strict_technical'
  | 'senior_engineer'
  | 'stress_interviewer'
  | 'engineering_manager'

export interface PersonalityConfig {
  id: InterviewerPersonality
  name: string
  description: string
  tone: string
  icon: string
  color: string
  traits: string[]
}

// ─── Core domain types ────────────────────────────────────────────────────────

export type ExperienceLevel = 'entry' | 'junior' | 'mid'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type InterviewType = 'technical' | 'behavioral' | 'mixed'
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'
export type EvidenceStatus = 'demonstrated' | 'developing' | 'needs_practice'

export type TopicKey =
  | 'java'
  | 'dsa'
  | 'dbms'
  | 'os'
  | 'networks'
  | 'behavioral'

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  email: string
  targetRole: string
  experienceLevel: ExperienceLevel
  preferredTopics: TopicKey[]
  createdAt: string
  updatedAt: string
}

// ─── Questions ────────────────────────────────────────────────────────────────

export interface Question {
  id: string
  topic: TopicKey
  type: InterviewType
  difficulty: Difficulty
  text: string
  followUp?: string
  tags: string[]
  concepts: string[]
}

// ─── Interview session ────────────────────────────────────────────────────────

export interface InterviewSession {
  id: string
  userId: string
  role: string
  topic: TopicKey
  difficulty: Difficulty
  interviewType: InterviewType
  personality: InterviewerPersonality
  questionCount: number
  status: SessionStatus
  overallScore: number | null
  createdAt: string
  completedAt: string | null
  questions: SessionQuestion[]
}

export interface SessionQuestion {
  id: string
  sessionId: string
  questionId: string
  question: Question
  answer: string | null
  evaluation: Evaluation | null
  orderIndex: number
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

export interface Evaluation {
  id: string
  sessionId: string
  questionId: string
  technicalScore: number    // 0–100
  completenessScore: number // 0–100
  clarityScore: number      // 0–100
  overallScore: number      // 0–100
  strengths: string[]
  improvements: string[]
  demonstratedConcepts: string[]
  missingConcepts: string[]
  evaluatedAt: string
  isMock?: boolean  // true when Gemini unavailable
}

// ─── Evidence & recommendations ───────────────────────────────────────────────

export interface ConceptEvidence {
  concept: string
  topic: TopicKey
  status: EvidenceStatus
  averageScore: number
  occurrences: number
  lastSeen: string
}

export interface TopicPerformance {
  topic: TopicKey
  topicLabel: string
  averageScore: number
  sessionsCount: number
  questionsAnswered: number
  evidenceStatus: EvidenceStatus
}

export interface PracticeRecommendation {
  id: string
  concept: string
  topic: TopicKey
  topicLabel: string
  reason: string
  priority: 1 | 2 | 3  // 1 = highest
  estimatedMinutes: number
  completed: boolean
  createdAt: string
}

// ─── Dashboard summary ────────────────────────────────────────────────────────

export interface DashboardData {
  readinessScore: number
  readinessExplanation: string
  totalSessions: number
  averageScore: number
  recentScoreTrend: ScoreTrendPoint[]
  topicPerformance: TopicPerformance[]
  evidenceMap: ConceptEvidence[]
  demonstratedConceptsCount: number
  needsPracticeConceptsCount: number
  recommendations: PracticeRecommendation[]
  recentSessions: InterviewSession[]
}

export interface ScoreTrendPoint {
  date: string
  score: number
  sessionId: string
  topic: string
}

// ─── Interview setup form ─────────────────────────────────────────────────────

export interface InterviewSetupForm {
  role: string
  topic: TopicKey
  difficulty: Difficulty
  questionCount: number
  interviewType: InterviewType
  personality: InterviewerPersonality
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
  status?: number
}

export interface EvaluateRequest {
  sessionId: string
  questionId: string
  questionText: string
  answerText: string
  topic: TopicKey
  difficulty: Difficulty
  personality?: string
}

export interface EvaluateResponse {
  evaluation: Evaluation
  isMock: boolean
}

// ─── Local storage types ──────────────────────────────────────────────────────

export interface LocalStore {
  profile: UserProfile | null
  sessions: InterviewSession[]
  version: number
}
