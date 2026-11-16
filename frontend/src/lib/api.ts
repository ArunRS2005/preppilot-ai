/**
 * Frontend API client.
 * Calls the FastAPI backend. Falls back to local mock mode when backend is unavailable.
 */

import type {
  InterviewSession,
  EvaluateRequest,
  EvaluateResponse,
  Question,
  TopicKey,
  Difficulty,
  InterviewType,
  DashboardData,
  PracticeRecommendation,
  UserProfile,
} from '@/types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {},
    timeoutMs = 15000
  ): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        },
      })

      if (!res.ok) {
        let detail = `HTTP ${res.status}`
        try {
          const body = (await res.json()) as { detail?: string }
          if (body.detail) detail = body.detail
        } catch { /* ignore */ }
        throw new ApiError(detail, res.status)
      }

      return res.json() as Promise<T>
    } catch (err) {
      if (err instanceof ApiError) throw err
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError('Request timed out. Please try again.', 408)
      }
      throw new ApiError('Network error. Check your connection.', 0)
    } finally {
      clearTimeout(timer)
    }
  }

  // ─── Health ───────────────────────────────────────────────────────────────
  async health(): Promise<{ status: string }> {
    return this.request('/health')
  }

  // ─── Questions ───────────────────────────────────────────────────────────
  async getQuestions(params: {
    topic?: TopicKey
    difficulty?: Difficulty
    type?: InterviewType
    count?: number
  }): Promise<Question[]> {
    const q = new URLSearchParams()
    if (params.topic) q.set('topic', params.topic)
    if (params.difficulty) q.set('difficulty', params.difficulty)
    if (params.type) q.set('type', params.type)
    if (params.count) q.set('count', String(params.count))
    return this.request(`/api/questions?${q}`)
  }

  // ─── Sessions ────────────────────────────────────────────────────────────
  async createSession(data: {
    userId: string
    role: string
    topic: TopicKey
    difficulty: Difficulty
    interviewType: InterviewType
    questionCount: number
  }): Promise<InterviewSession> {
    return this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async completeSession(sessionId: string): Promise<InterviewSession> {
    return this.request(`/api/sessions/${sessionId}/complete`, {
      method: 'POST',
    })
  }

  async getSessions(userId: string): Promise<InterviewSession[]> {
    return this.request(`/api/sessions?user_id=${userId}`)
  }

  async getSession(sessionId: string): Promise<InterviewSession> {
    return this.request(`/api/sessions/${sessionId}`)
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.request(`/api/sessions/${sessionId}`, { method: 'DELETE' })
  }

  // ─── Evaluation ──────────────────────────────────────────────────────────
  async evaluate(req: EvaluateRequest): Promise<EvaluateResponse> {
    return this.request('/api/evaluate', {
      method: 'POST',
      body: JSON.stringify(req),
    }, 30000) // evaluation can take longer
  }

  // ─── Dashboard & evidence ────────────────────────────────────────────────
  async getDashboard(userId: string): Promise<DashboardData> {
    return this.request(`/api/dashboard?user_id=${userId}`)
  }

  async getRecommendations(userId: string): Promise<PracticeRecommendation[]> {
    return this.request(`/api/recommendations?user_id=${userId}`)
  }

  // ─── Profile ─────────────────────────────────────────────────────────────
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request(`/api/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiClient = new ApiClient()

// ─── Backend availability check ───────────────────────────────────────────────
let _backendAvailable: boolean | null = null

export async function isBackendAvailable(): Promise<boolean> {
  if (_backendAvailable !== null) return _backendAvailable
  try {
    await apiClient.health()
    _backendAvailable = true
  } catch {
    _backendAvailable = false
  }
  return _backendAvailable
}

// Allow resetting the cached check (useful after config changes)
export function resetBackendCheck(): void {
  _backendAvailable = null
}
