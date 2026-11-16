/**
 * Mock evaluation engine for development without Gemini API.
 * Produces plausible-looking scores based on answer length and
 * keyword matching. NOT a substitute for Gemini evaluation.
 *
 * This is clearly marked in evaluation results and in the UI.
 */

import type { Evaluation } from '@/types'
import type { TopicKey, Difficulty } from '@/types'
import { generateId } from './utils'

interface MockEvalInput {
  questionText: string
  answerText: string
  topic: TopicKey
  difficulty: Difficulty
  concepts: string[]
}

export function mockEvaluate(input: MockEvalInput): Evaluation {
  const { answerText, difficulty, concepts } = input

  const wordCount = answerText.trim().split(/\s+/).length
  const lowerAnswer = answerText.toLowerCase()

  // Base score from word count (simple heuristic — clearly not real AI)
  const lengthScore = Math.min(85, Math.max(20, wordCount * 1.5))

  // Concept hit rate
  const hitConcepts = concepts.filter(c =>
    lowerAnswer.includes(c.toLowerCase())
  )
  const missingConcepts = concepts.filter(c =>
    !lowerAnswer.includes(c.toLowerCase())
  )
  const conceptBonus = (hitConcepts.length / Math.max(1, concepts.length)) * 20

  // Difficulty modifier
  const difficultyMod = { easy: 5, medium: 0, hard: -5 }[difficulty]

  const baseScore = Math.round(Math.min(95, Math.max(15, lengthScore + conceptBonus + difficultyMod)))

  // Slight variation across dimensions
  const technical = clamp(baseScore + randInt(-8, 5), 10, 95)
  const completeness = clamp(baseScore + randInt(-5, 8), 10, 95)
  const clarity = clamp(baseScore + randInt(-6, 6), 10, 95)
  const overall = Math.round((technical + completeness + clarity) / 3)

  // Generate mock feedback
  const strengths = generateStrengths(wordCount, hitConcepts)
  const improvements = generateImprovements(missingConcepts, wordCount, overall)

  return {
    id: generateId(),
    sessionId: '',
    questionId: '',
    technicalScore: technical,
    completenessScore: completeness,
    clarityScore: clarity,
    overallScore: overall,
    strengths,
    improvements,
    demonstratedConcepts: hitConcepts.length > 0 ? hitConcepts : [],
    missingConcepts: missingConcepts.slice(0, 4),
    evaluatedAt: new Date().toISOString(),
    isMock: true,
  }
}

function generateStrengths(wordCount: number, hitConcepts: string[]): string[] {
  const strengths: string[] = []
  if (wordCount >= 60) strengths.push('Provided a reasonably detailed explanation.')
  if (hitConcepts.length > 0) {
    strengths.push(`Addressed key concepts: ${hitConcepts.slice(0, 3).join(', ')}.`)
  }
  if (wordCount >= 30) strengths.push('Answer shows familiarity with the topic area.')
  if (strengths.length === 0) strengths.push('Attempted to answer the question.')
  return strengths.slice(0, 3)
}

function generateImprovements(
  missingConcepts: string[],
  wordCount: number,
  score: number
): string[] {
  const improvements: string[] = []
  if (wordCount < 40) {
    improvements.push('Expand your answer with more detail and examples.')
  }
  if (missingConcepts.length > 0) {
    improvements.push(
      `Cover these concepts for a more complete answer: ${missingConcepts.slice(0, 3).join(', ')}.`
    )
  }
  if (score < 60) {
    improvements.push('Review the fundamentals of this topic before your next session.')
  }
  improvements.push('Include real-world examples to strengthen your explanation.')
  return improvements.slice(0, 3)
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
