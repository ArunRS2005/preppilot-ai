import { describe, it, expect } from 'vitest'
import {
  calcEvidenceStatus,
  calcReadinessScore,
  buildTopicPerformance,
} from '@/lib/utils'
import type { TopicPerformance, InterviewSession } from '@/types'

describe('calcEvidenceStatus', () => {
  it('returns demonstrated when avg >= 75 and occurrences >= 2', () => {
    expect(calcEvidenceStatus(80, 3)).toBe('demonstrated')
    expect(calcEvidenceStatus(75, 2)).toBe('demonstrated')
  })

  it('returns developing when avg >= 50 but not demonstrated', () => {
    expect(calcEvidenceStatus(70, 1)).toBe('developing') // only 1 occurrence
    expect(calcEvidenceStatus(50, 5)).toBe('developing')
  })

  it('returns needs_practice for low scores', () => {
    expect(calcEvidenceStatus(40, 3)).toBe('needs_practice')
    expect(calcEvidenceStatus(0, 0)).toBe('needs_practice')
  })
})

describe('calcReadinessScore', () => {
  it('returns 0 with empty topic performance', () => {
    const { score } = calcReadinessScore([])
    expect(score).toBe(0)
  })

  it('computes score within 0–100 range', () => {
    const topics: TopicPerformance[] = [
      { topic: 'java', topicLabel: 'Java', averageScore: 80, sessionsCount: 2, questionsAnswered: 6, evidenceStatus: 'demonstrated' },
      { topic: 'dsa', topicLabel: 'DSA', averageScore: 60, sessionsCount: 1, questionsAnswered: 3, evidenceStatus: 'developing' },
    ]
    const { score } = calcReadinessScore(topics)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('higher scores and more topics increase readiness', () => {
    const fewTopics: TopicPerformance[] = [
      { topic: 'java', topicLabel: 'Java', averageScore: 70, sessionsCount: 1, questionsAnswered: 3, evidenceStatus: 'developing' },
    ]
    const manyTopics: TopicPerformance[] = [
      { topic: 'java', topicLabel: 'Java', averageScore: 70, sessionsCount: 1, questionsAnswered: 3, evidenceStatus: 'developing' },
      { topic: 'dsa', topicLabel: 'DSA', averageScore: 70, sessionsCount: 1, questionsAnswered: 3, evidenceStatus: 'developing' },
      { topic: 'dbms', topicLabel: 'DBMS', averageScore: 70, sessionsCount: 1, questionsAnswered: 3, evidenceStatus: 'developing' },
    ]
    const { score: few } = calcReadinessScore(fewTopics)
    const { score: many } = calcReadinessScore(manyTopics)
    expect(many).toBeGreaterThan(few)
  })

  it('returns explanation string', () => {
    const topics: TopicPerformance[] = [
      { topic: 'java', topicLabel: 'Java', averageScore: 75, sessionsCount: 2, questionsAnswered: 5, evidenceStatus: 'demonstrated' },
    ]
    const { explanation } = calcReadinessScore(topics)
    expect(typeof explanation).toBe('string')
    expect(explanation.length).toBeGreaterThan(0)
  })
})

describe('buildTopicPerformance', () => {
  it('returns empty array for no sessions', () => {
    expect(buildTopicPerformance([])).toEqual([])
  })

  it('computes correct averages from completed sessions', () => {
    const sessions: InterviewSession[] = [
      {
        id: '1',
        userId: 'u1',
        role: 'SWE',
        topic: 'java',
        difficulty: 'medium',
        interviewType: 'technical',
        personality: 'friendly_mentor',
        questionCount: 2,
        status: 'completed',
        overallScore: 70,
        createdAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T01:00:00Z',
        questions: [
          {
            id: 'q1',
            sessionId: '1',
            questionId: 'java-001',
            question: { id: 'java-001', topic: 'java', type: 'technical', difficulty: 'medium', text: 'Q', tags: [], concepts: [] },
            answer: 'A',
            evaluation: {
              id: 'e1',
              sessionId: '1',
              questionId: 'java-001',
              technicalScore: 70,
              completenessScore: 70,
              clarityScore: 70,
              overallScore: 70,
              strengths: [],
              improvements: [],
              demonstratedConcepts: [],
              missingConcepts: [],
              evaluatedAt: '2024-01-01T01:00:00Z',
            },
            orderIndex: 0,
          },
        ],
      },
    ]

    const result = buildTopicPerformance(sessions)
    expect(result).toHaveLength(1)
    expect(result[0].topic).toBe('java')
    expect(result[0].averageScore).toBe(70)
  })
})
