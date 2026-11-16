import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Trash2, Brain, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { useAppStore } from '@/store/useAppStore'
import { TOPIC_LABELS, DIFFICULTY_COLORS, formatDate } from '@/lib/utils'
import type { SessionQuestion } from '@/types'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getSession, removeSession, loadSessions } = useAppStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => { loadSessions() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const session = getSession(id ?? '')

  if (!session) return <PageLoading label="Loading session…" />

  function handleDelete() {
    if (!session) return
    removeSession(session.id)
    navigate('/history')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/history')} leftIcon={<ChevronLeft />}>
          History
        </Button>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{TOPIC_LABELS[session.topic]}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {session.role} · {session.questionCount} questions ·{' '}
            {session.completedAt ? formatDate(session.completedAt) : 'In progress'}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className={DIFFICULTY_COLORS[session.difficulty]}>{session.difficulty}</Badge>
            <Badge variant="default">{session.interviewType}</Badge>
          </div>
        </div>
        {session.overallScore !== null && (
          <ScoreRing score={session.overallScore} size="md" />
        )}
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {session.questions.map((sq, i) => (
          <QuestionReviewCard key={sq.id} sq={sq} index={i + 1} />
        ))}
      </div>

      {/* Delete */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        {!confirmDelete ? (
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 />}
            onClick={() => setConfirmDelete(true)}
          >
            Delete This Session
          </Button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-slate-400">Permanently delete this session and all its data?</p>
            <Button variant="danger" size="sm" onClick={handleDelete}>Yes, Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionReviewCard({ sq, index }: { sq: SessionQuestion; index: number }) {
  const ev = sq.evaluation

  return (
    <Card>
      {/* Question */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold shrink-0">
          {index}
        </div>
        <div>
          <p className="text-xs text-violet-400 uppercase tracking-wide mb-1">
            {sq.question.type} · {sq.question.topic.toUpperCase()}
          </p>
          <p className="text-sm font-medium text-white">{sq.question.text}</p>
        </div>
      </div>

      {/* Answer */}
      {sq.answer ? (
        <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <p className="text-xs text-slate-500 mb-1.5">Your answer:</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{sq.answer}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-600 mb-4 italic">Not answered</p>
      )}

      {/* Evaluation */}
      {ev && (
        <div className="space-y-3">
          {ev.isMock && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-warning-500/10 border border-warning-500/20">
              <AlertTriangle className="h-3.5 w-3.5 text-warning-400 shrink-0" />
              <p className="text-xs text-warning-300">Mock evaluation (Gemini unavailable)</p>
            </div>
          )}

          {/* Scores */}
          <div className="flex items-center gap-4">
            <ScoreRing score={ev.overallScore} size="sm" showLabel={false} />
            <div className="flex-1 space-y-1.5">
              <ScoreRow label="Technical" value={ev.technicalScore} />
              <ScoreRow label="Completeness" value={ev.completenessScore} />
              <ScoreRow label="Clarity" value={ev.clarityScore} />
            </div>
          </div>

          {/* Strengths */}
          {ev.strengths.length > 0 && (
            <div>
              <p className="text-xs font-medium text-success-400 mb-1.5 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Strengths
              </p>
              <ul className="space-y-1">
                {ev.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-success-400 mt-0.5">·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {ev.improvements.length > 0 && (
            <div>
              <p className="text-xs font-medium text-warning-400 mb-1.5">Areas to improve:</p>
              <ul className="space-y-1">
                {ev.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-warning-400 mt-0.5">·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concepts */}
          <div>
            <p className="text-xs font-medium text-white mb-2 flex items-center gap-1">
              <Brain className="h-3 w-3 text-violet-400" /> Concepts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ev.demonstratedConcepts.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-success-500/10 text-success-400 text-xs border border-success-500/20">
                  {c}
                </span>
              ))}
              {ev.missingConcepts.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-danger-500/10 text-danger-400 text-xs border border-danger-500/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1">
        <ProgressBar value={value} size="sm" color="auto" />
      </div>
      <span className="text-xs text-white w-7 text-right">{value}%</span>
    </div>
  )
}
