import { describe, it, expect } from 'vitest'
import { mockEvaluate } from '@/lib/mockEvaluate'

describe('mockEvaluate', () => {
  const baseInput = {
    questionText: 'What is a binary search tree?',
    answerText: '',
    topic: 'dsa' as const,
    difficulty: 'medium' as const,
    concepts: ['binary search tree', 'BST properties', 'balanced tree'],
  }

  it('returns a valid evaluation object', () => {
    const ev = mockEvaluate({ ...baseInput, answerText: 'A BST is a tree where left < root < right.' })
    expect(ev.overallScore).toBeGreaterThanOrEqual(0)
    expect(ev.overallScore).toBeLessThanOrEqual(100)
    expect(ev.technicalScore).toBeGreaterThanOrEqual(0)
    expect(ev.clarityScore).toBeGreaterThanOrEqual(0)
    expect(ev.isMock).toBe(true)
    expect(Array.isArray(ev.strengths)).toBe(true)
    expect(Array.isArray(ev.improvements)).toBe(true)
    expect(Array.isArray(ev.demonstratedConcepts)).toBe(true)
    expect(Array.isArray(ev.missingConcepts)).toBe(true)
  })

  it('all scores are integers', () => {
    const ev = mockEvaluate({ ...baseInput, answerText: 'A binary search tree has ordered properties.' })
    expect(Number.isInteger(ev.overallScore)).toBe(true)
    expect(Number.isInteger(ev.technicalScore)).toBe(true)
    expect(Number.isInteger(ev.completenessScore)).toBe(true)
    expect(Number.isInteger(ev.clarityScore)).toBe(true)
  })

  it('detects concepts mentioned in the answer', () => {
    const ev = mockEvaluate({
      ...baseInput,
      answerText: 'A binary search tree has BST properties that keep it balanced.',
    })
    expect(ev.demonstratedConcepts.length).toBeGreaterThan(0)
  })

  it('marks unmentioned concepts as missing', () => {
    const ev = mockEvaluate({
      ...baseInput,
      answerText: 'A tree is a data structure.',
    })
    // None of the specific concepts should be demonstrated
    expect(ev.missingConcepts.length).toBeGreaterThan(0)
  })

  it('handles empty answer without throwing', () => {
    expect(() => mockEvaluate({ ...baseInput, answerText: '' })).not.toThrow()
  })

  it('overall score matches average of dimension scores', () => {
    const ev = mockEvaluate({ ...baseInput, answerText: 'BST has binary search tree properties.' })
    const avg = Math.round((ev.technicalScore + ev.completenessScore + ev.clarityScore) / 3)
    expect(ev.overallScore).toBe(avg)
  })
})
