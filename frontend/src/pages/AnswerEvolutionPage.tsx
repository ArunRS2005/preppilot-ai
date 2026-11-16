/**
 * Answer Evolution Tracker
 * Shows how a user's answers to the same question have improved over time.
 * Uses actual saved answers and evaluations — no fabricated comparisons.
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { FadeInView } from '@/components/ui/motion'
import { TOPIC_LABELS, DIFFICULTY_COLORS, formatDate } from '@/lib/utils'
import type { SessionQuestion } from '@/types'

interface QuestionHistory {
  questionId: string
  questionText: string
  topic: import('@/types').TopicKey
  difficulty: import('@/types').Difficulty
  attempts: Array<SessionQuestion & { sessionDate: string; sessionRole: string }>
}

function buildQuestionHistory(sessions: import('@/types').InterviewSession[]): QuestionHistory[] {
  const map = new Map<string, QuestionHistory>()

  for (const session of sessions) {
    if (session.status !== 'completed') continue
    for (const sq of session.questions) {
      if (!sq.answer || !sq.evaluation) continue
      const key = sq.questionId
      if (!map.has(key)) {
        map.set(key, {
          questionId: key,
          questionText: sq.question.text,
          topic: session.topic,
          difficulty: session.difficulty,
          attempts: [],
        })
      }
      map.get(key)!.attempts.push({
        ...sq,
        sessionDate: session.completedAt ?? session.createdAt,
        sessionRole: session.role,
      })
    }
  }

  // Only return questions answered more than once — those show evolution
  return Array.from(map.values())
    .filter(q => q.attempts.length >= 2)
    .map(q => ({
      ...q,
      attempts: q.attempts.sort((a, b) =>
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
      ),
    }))
    .sort((a, b) => {
      const aLast = a.attempts[a.attempts.length - 1].evaluation!.overallScore
      const bLast = b.attempts[b.attempts.length - 1].evaluation!.overallScore
      return bLast - aLast
    })
}

export function AnswerEvolutionPage() {
  const navigate = useNavigate()
  const { sessions, loadSessions, loadProfile } = useAppStore()
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [compareIdx, setCompareIdx] = useState<[number, number]>([0, 1])

  useEffect(() => { loadProfile(); loadSessions() }, []) // eslint-disable-line

  const questionHistory = useMemo(() => buildQuestionHistory(sessions), [sessions])

  useEffect(() => {
    if (questionHistory.length > 0 && !selectedQuestion) {
      setSelectedQuestion(questionHistory[0].questionId)
      setCompareIdx([0, questionHistory[0].attempts.length - 1])
    }
  }, [questionHistory]) // eslint-disable-line

  const selectedHistory = questionHistory.find(q => q.questionId === selectedQuestion)

  if (sessions.filter(s => s.status === 'completed').length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<TrendingUp className="h-8 w-8" />}
          title="No answer history yet"
          description="Complete interview sessions. Answer the same question more than once to see your answer evolution here."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      </div>
    )
  }

  if (questionHistory.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<TrendingUp className="h-8 w-8" />}
          title="Answer the same question twice"
          description="You haven't answered any question more than once yet. Try the same question again to compare your improvement."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeInView className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-violet-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">Answer Evolution</h1>
        </div>
        <p className="text-slate-400 text-sm max-w-xl">
          Compare your answers to the same question over time. See exactly what improved and what still needs work.
        </p>
      </FadeInView>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Question list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Questions with multiple attempts
          </p>
          {questionHistory.map(q => {
            const first = q.attempts[0].evaluation!.overallScore
            const last = q.attempts[q.attempts.length - 1].evaluation!.overallScore
            const delta = last - first
            const isSelected = q.questionId === selectedQuestion
            return (
              <button
                key={q.questionId}
                onClick={() => { setSelectedQuestion(q.questionId); setCompareIdx([0, q.attempts.length - 1]) }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                    : 'border-white/[0.05] bg-navy-800/50 text-slate-400 hover:border-white/[0.1] hover:text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium line-clamp-2 flex-1">{q.questionText}</p>
                  <span className={`text-xs font-bold num shrink-0 ${delta > 0 ? 'text-success-400' : delta < 0 ? 'text-danger-400' : 'text-slate-400'}`}>
                    {delta > 0 ? '+' : ''}{delta}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" size="sm">{q.attempts.length} attempts</Badge>
                  <span className="text-2xs text-slate-600">{TOPIC_LABELS[q.topic]}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Comparison panel */}
        <div className="lg:col-span-2">
          {selectedHistory ? (
            <div className="space-y-4">
              {/* Question */}
              <Card>
                <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">Question</p>
                <p className="text-sm font-medium text-white leading-relaxed">{selectedHistory.questionText}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="purple" size="sm">{TOPIC_LABELS[selectedHistory.topic]}</Badge>
                  <Badge variant="default" size="sm" className={DIFFICULTY_COLORS[selectedHistory.difficulty]}>{selectedHistory.difficulty}</Badge>
                </div>
              </Card>

              {/* Attempt selector */}
              {selectedHistory.attempts.length > 2 && (
                <div className="flex items-center gap-3">
                  <select
                    value={compareIdx[0]}
                    onChange={e => setCompareIdx([Number(e.target.value), compareIdx[1]])}
                    className="flex-1 bg-navy-800/80 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    aria-label="Select first attempt to compare"
                  >
                    {selectedHistory.attempts.map((a, i) => (
                      <option key={i} value={i} className="bg-navy-900">
                        Attempt {i + 1} — {formatDate(a.sessionDate)} ({a.evaluation!.overallScore}%)
                      </option>
                    ))}
                  </select>
                  <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
                  <select
                    value={compareIdx[1]}
                    onChange={e => setCompareIdx([compareIdx[0], Number(e.target.value)])}
                    className="flex-1 bg-navy-800/80 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    aria-label="Select second attempt to compare"
                  >
                    {selectedHistory.attempts.map((a, i) => (
                      <option key={i} value={i} className="bg-navy-900">
                        Attempt {i + 1} — {formatDate(a.sessionDate)} ({a.evaluation!.overallScore}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Side-by-side comparison */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[compareIdx[0], compareIdx[1]].map((idx, col) => {
                  const attempt = selectedHistory.attempts[idx]
                  if (!attempt) return null
                  const ev = attempt.evaluation!
                  const isNewer = col === 1
                  return (
                    <Card key={idx} className={isNewer ? 'border-violet-500/20 bg-violet-500/5' : ''}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Attempt {idx + 1}</p>
                          <p className="text-xs font-medium text-slate-300">{formatDate(attempt.sessionDate)}</p>
                        </div>
                        <ScoreRing score={ev.overallScore} size="sm" showLabel={false} />
                      </div>

                      {/* Score breakdown */}
                      <div className="space-y-1.5 mb-4">
                        {[
                          { label: 'Technical', val: ev.technicalScore },
                          { label: 'Complete', val: ev.completenessScore },
                          { label: 'Clarity', val: ev.clarityScore },
                        ].map(d => (
                          <div key={d.label} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 w-14 shrink-0">{d.label}</span>
                            <div className="flex-1"><ProgressBar value={d.val} size="xs" color="auto" animated /></div>
                            <span className="text-slate-400 w-6 text-right num">{d.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Answer */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-3">
                        <p className="text-xs text-slate-500 mb-1.5">Answer:</p>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-6">{attempt.answer}</p>
                      </div>

                      {/* Concepts */}
                      {ev.demonstratedConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ev.demonstratedConcepts.slice(0, 4).map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded-md bg-success-500/10 text-success-400 text-2xs border border-success-500/20">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>

              {/* Delta analysis */}
              {(() => {
                const first = selectedHistory.attempts[compareIdx[0]]?.evaluation
                const second = selectedHistory.attempts[compareIdx[1]]?.evaluation
                if (!first || !second || compareIdx[0] === compareIdx[1]) return null
                const delta = second.overallScore - first.overallScore
                return (
                  <Card className={delta >= 0 ? 'border-success-500/20 bg-success-500/5' : 'border-danger-500/20 bg-danger-500/5'}>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold num ${delta >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        {delta >= 0 ? '+' : ''}{delta}%
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {delta > 5 ? 'Significant improvement' : delta > 0 ? 'Some improvement' : delta === 0 ? 'No change' : 'Score decreased'}
                        </p>
                        <p className="text-xs text-slate-500">Between attempt {compareIdx[0] + 1} and attempt {compareIdx[1] + 1}</p>
                      </div>
                    </div>
                  </Card>
                )
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              Select a question from the list to compare attempts.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
