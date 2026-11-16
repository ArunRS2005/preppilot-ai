import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useBeforeUnload } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, Clock, CheckCircle, AlertTriangle,
  Brain, Zap, RotateCcw, Home, Send,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { useAppStore } from '@/store/useAppStore'
import { mockEvaluate } from '@/lib/mockEvaluate'
import { TOPIC_LABELS, DIFFICULTY_COLORS, formatDate, PERSONALITY_CONFIGS } from '@/lib/utils'
import type { InterviewSession, Evaluation } from '@/types'

type Phase = 'answering' | 'evaluating' | 'feedback' | 'summary'

export function MockInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { getSession, saveSession, setActiveSession, loadSessions } = useAppStore()

  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState<Phase>('answering')
  const [evalError, setEvalError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load session
  useEffect(() => {
    loadSessions()
    const s = getSession(sessionId ?? '')
    if (!s) {
      navigate('/dashboard')
      return
    }
    setSession(s)
    // Resume at last unanswered question
    const lastAnswered = s.questions.findIndex(q => q.answer === null)
    setCurrentIdx(lastAnswered >= 0 ? lastAnswered : 0)
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive])

  // Warn on accidental navigation during answering
  useBeforeUnload(
    useCallback(
      (e) => {
        if (phase === 'answering' && answer.trim()) {
          e.preventDefault()
        }
      },
      [phase, answer]
    )
  )

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading interview…" />
      </div>
    )
  }

  const question = session.questions[currentIdx]
  const isLast = currentIdx === session.questions.length - 1
  const totalQuestions = session.questions.length
  const answeredCount = session.questions.filter(q => q.answer !== null).length

  // ─── Actions ────────────────────────────────────────────────────────────────

  function updateSession(updated: InterviewSession) {
    setSession(updated)
    saveSession(updated)
  }

  async function handleSubmitAnswer() {
    if (!answer.trim() || !session) return
    setPhase('evaluating')
    setEvalError(null)
    if (timerRef.current) clearInterval(timerRef.current)

    const sess = session  // narrowed non-null reference for closures

    const attempt = async (): Promise<Evaluation> => {
      // Try backend first; fall back to mock if unavailable
      try {
        const { apiClient, isBackendAvailable } = await import('@/lib/api')
        const available = await isBackendAvailable()
        if (available) {
          const res = await apiClient.evaluate({
            sessionId: sess.id,
            questionId: question.questionId,
            questionText: question.question.text,
            answerText: answer,
            topic: sess.topic,
            difficulty: sess.difficulty,
            personality: sess.personality,
          })
          return res.evaluation
        }
      } catch {
        // fall through to mock
      }
      return mockEvaluate({
        questionText: question.question.text,
        answerText: answer,
        topic: sess.topic,
        difficulty: sess.difficulty,
        concepts: question.question.concepts,
      })
    }

    let evaluation: Evaluation | null = null
    let lastError: string | null = null

    for (let i = 0; i < 3; i++) {
      try {
        evaluation = await attempt()
        break
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Evaluation failed. Please try again.'
        if (i < 2) await sleep(1000 * (i + 1))
      }
    }

    if (!evaluation) {
      setEvalError(lastError ?? 'Evaluation failed after multiple attempts.')
      setPhase('answering')
      setRetryCount(c => c + 1)
      return
    }

    // Save answer + evaluation to session
    const updatedQuestions = sess.questions.map((q, i) =>
      i === currentIdx ? { ...q, answer, evaluation } : q
    )
    const updatedSession: InterviewSession = { ...sess, questions: updatedQuestions }
    updateSession(updatedSession)
    setPhase('feedback')
  }

  function handleNext() {
    if (isLast) {
      finishSession()
    } else {
      setCurrentIdx(i => i + 1)
      setAnswer('')
      setPhase('answering')
      setEvalError(null)
      setElapsed(0)
      setTimerActive(false)
    }
  }

  function handleBack() {
    if (currentIdx > 0 && phase === 'answering' && session) {
      setCurrentIdx(i => i - 1)
      setAnswer(session.questions[currentIdx - 1].answer ?? '')
      setPhase(session.questions[currentIdx - 1].evaluation ? 'feedback' : 'answering')
      setEvalError(null)
    }
  }

  function finishSession() {
    if (!session) return
    const scores = session.questions
      .map(q => q.evaluation?.overallScore)
      .filter((s): s is number => s !== null && s !== undefined)
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

    const completed: InterviewSession = {
      ...session,
      status: 'completed' as const,
      overallScore,
      completedAt: new Date().toISOString(),
    }
    updateSession(completed)
    setActiveSession(null)
    setPhase('summary')
  }

  // ─── Render phases ───────────────────────────────────────────────────────────

  if (phase === 'summary') {
    return <SessionSummary session={session} onDashboard={() => navigate('/dashboard')} onNewInterview={() => navigate('/interview/setup')} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-400">
          <span>Question {currentIdx + 1} of {totalQuestions}</span>
          <div className="flex items-center gap-3">
            <Badge variant="purple">{TOPIC_LABELS[session.topic]}</Badge>
            <Badge variant="default" className={DIFFICULTY_COLORS[session.difficulty]}>
              {session.difficulty}
            </Badge>
            {session.personality && (
              <span className="text-xs text-slate-500" title={PERSONALITY_CONFIGS[session.personality]?.name}>
                {PERSONALITY_CONFIGS[session.personality]?.icon}
              </span>
            )}
            <TimerDisplay
              elapsed={elapsed}
              active={timerActive}
              onToggle={() => setTimerActive(v => !v)}
            />
          </div>
        </div>
        <ProgressBar
          value={answeredCount + (phase === 'feedback' ? 0 : 0)}
          max={totalQuestions}
          color="violet"
          size="sm"
        />
      </div>

      {/* Question card */}
      <Card className="mb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold shrink-0">
            {currentIdx + 1}
          </div>
          <div>
            <p className="text-xs font-medium text-violet-400 uppercase tracking-wide mb-1">
              {question.question.type} · {question.question.topic.toUpperCase()}
            </p>
            <h2 className="text-base font-medium text-white leading-relaxed">
              {question.question.text}
            </h2>
          </div>
        </div>

        {question.question.followUp && phase === 'answering' && (
          <div className="mt-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
            <p className="text-xs text-violet-300 font-medium mb-1">Follow-up to consider:</p>
            <p className="text-sm text-slate-400">{question.question.followUp}</p>
          </div>
        )}
      </Card>

      {/* Answer / feedback area */}
      {phase === 'answering' && (
        <AnswerPhase
          answer={answer}
          onChange={setAnswer}
          onSubmit={handleSubmitAnswer}
          error={evalError}
          retryCount={retryCount}
          hasExistingAnswer={!!question.answer}
          existingAnswer={question.answer}
          onBack={currentIdx > 0 ? handleBack : undefined}
        />
      )}

      {phase === 'evaluating' && (
        <Card className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20">
            <Brain className="h-7 w-7 text-violet-400 animate-pulse-slow" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-white mb-1">Evaluating your answer…</p>
            <p className="text-sm text-slate-400">AI is reviewing correctness, clarity, and completeness</p>
          </div>
          <LoadingSpinner size="md" />
        </Card>
      )}

      {phase === 'feedback' && question.evaluation && (
        <FeedbackPhase
          evaluation={question.evaluation}
          isLast={isLast}
          onNext={handleNext}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
        />
      )}
    </div>
  )
}

// ─── Answer phase ─────────────────────────────────────────────────────────────

function AnswerPhase({
  answer, onChange, onSubmit, error, retryCount, hasExistingAnswer, existingAnswer, onBack,
}: {
  answer: string
  onChange: (v: string) => void
  onSubmit: () => void
  error: string | null
  retryCount: number
  hasExistingAnswer: boolean
  existingAnswer: string | null
  onBack?: () => void
}) {
  return (
    <div className="space-y-4">
      {hasExistingAnswer && existingAnswer && (
        <div className="p-3 rounded-xl bg-success-500/5 border border-success-500/20">
          <p className="text-xs text-success-400 font-medium mb-1 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Previous answer (already evaluated)
          </p>
          <p className="text-sm text-slate-300 line-clamp-3">{existingAnswer}</p>
        </div>
      )}

      <Textarea
        label="Your Answer"
        value={answer}
        onChange={e => onChange(e.target.value)}
        placeholder="Type your answer here. Be thorough — include examples where relevant…"
        rows={8}
        aria-describedby={error ? 'answer-error' : undefined}
      />

      {error && (
        <ErrorMessage
          title={retryCount > 0 ? `Evaluation failed (attempt ${retryCount})` : 'Evaluation failed'}
          message={error}
          onRetry={onSubmit}
          retryLabel="Retry Evaluation"
        />
      )}

      <div className="flex gap-3">
        {onBack && (
          <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft />}>
            Back
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={onSubmit}
          disabled={!answer.trim()}
          leftIcon={<Send />}
        >
          Submit Answer
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Answer is evaluated by AI. If backend is unavailable, a mock evaluation is used (clearly indicated in feedback).
      </p>
    </div>
  )
}

// ─── Feedback phase ───────────────────────────────────────────────────────────

function FeedbackPhase({
  evaluation, isLast, onNext, answeredCount, totalQuestions,
}: {
  evaluation: Evaluation
  isLast: boolean
  onNext: () => void
  answeredCount: number
  totalQuestions: number
}) {
  return (
    <div className="space-y-4 animate-slide-up">
      {evaluation.isMock && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-500/10 border border-warning-500/20">
          <AlertTriangle className="h-4 w-4 text-warning-400 shrink-0" aria-hidden="true" />
          <p className="text-sm text-warning-300">
            <strong>Mock evaluation</strong> — Backend/Gemini unavailable. This is a simulated score for practice only.
          </p>
        </div>
      )}

      {/* Score overview */}
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <ScoreRing score={evaluation.overallScore} size="lg" />
          <div className="flex-1 w-full">
            <h3 className="text-sm font-semibold text-white mb-3">Score Breakdown</h3>
            <div className="space-y-2.5">
              <ScoreBreakdownRow label="Technical Correctness" score={evaluation.technicalScore} />
              <ScoreBreakdownRow label="Completeness" score={evaluation.completenessScore} />
              <ScoreBreakdownRow label="Clarity" score={evaluation.clarityScore} />
            </div>
          </div>
        </div>
      </Card>

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-success-400 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Strengths
          </h3>
          <ul className="space-y-1.5">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-success-400 mt-0.5 shrink-0">·</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Improvements */}
      {evaluation.improvements.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-warning-400 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" aria-hidden="true" />
            How to Improve
          </h3>
          <ul className="space-y-1.5">
            {evaluation.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-warning-400 mt-0.5 shrink-0">·</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Concepts */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-400" aria-hidden="true" />
          Concept Evidence
        </h3>
        {evaluation.demonstratedConcepts.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-1.5">Demonstrated:</p>
            <div className="flex flex-wrap gap-1.5">
              {evaluation.demonstratedConcepts.map(c => (
                <span key={c} className="px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400 text-xs border border-success-500/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {evaluation.missingConcepts.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Missing or needs improvement:</p>
            <div className="flex flex-wrap gap-1.5">
              {evaluation.missingConcepts.map(c => (
                <span key={c} className="px-2.5 py-1 rounded-lg bg-danger-500/10 text-danger-400 text-xs border border-danger-500/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <Button
        className="w-full"
        onClick={onNext}
        rightIcon={isLast ? <CheckCircle /> : <ChevronRight />}
        size="lg"
      >
        {isLast ? `Finish Interview (${answeredCount}/${totalQuestions} answered)` : 'Next Question'}
      </Button>
    </div>
  )
}

function ScoreBreakdownRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-36 shrink-0">{label}</span>
      <div className="flex-1">
        <ProgressBar value={score} size="sm" color="auto" />
      </div>
      <span className="text-xs font-medium text-white w-8 text-right">{score}%</span>
    </div>
  )
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function TimerDisplay({
  elapsed, active, onToggle,
}: {
  elapsed: number
  active: boolean
  onToggle: () => void
}) {
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
      aria-label={active ? 'Pause timer' : 'Start timer'}
      title={active ? 'Pause timer' : 'Start timer'}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-mono tabular-nums">{mm}:{ss}</span>
    </button>
  )
}

// ─── Session summary ──────────────────────────────────────────────────────────

function SessionSummary({
  session, onDashboard, onNewInterview,
}: {
  session: InterviewSession
  onDashboard: () => void
  onNewInterview: () => void
}) {
  const scores = session.questions
    .map(q => q.evaluation?.overallScore)
    .filter((s): s is number => s !== undefined && s !== null)
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const allConcepts = session.questions.flatMap(q => q.evaluation?.demonstratedConcepts ?? [])
  const uniqueConcepts = [...new Set(allConcepts)]

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 animate-slide-up">
      <div className="text-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-500/10 border border-success-500/20 mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-success-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Interview Complete!</h1>
        <p className="text-slate-400">
          {TOPIC_LABELS[session.topic]} · {session.role} · {formatDate(session.completedAt ?? new Date().toISOString())}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <ScoreRing score={avg} size="md" className="mx-auto mb-2" />
          <p className="text-xs text-slate-400">Average Score</p>
        </Card>
        <Card className="text-center flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-white">{session.questions.length}</p>
          <p className="text-xs text-slate-400 mt-1">Questions</p>
        </Card>
        <Card className="text-center flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-success-400">{uniqueConcepts.length}</p>
          <p className="text-xs text-slate-400 mt-1">Concepts shown</p>
        </Card>
      </div>

      {/* Per-question scores */}
      <Card className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Question Scores</h2>
        <div className="space-y-2">
          {session.questions.map((q, i) => (
            <div key={q.id} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate">{q.question.text}</p>
              </div>
              {q.evaluation ? (
                <span className="text-xs font-semibold text-white shrink-0">{q.evaluation.overallScore}%</span>
              ) : (
                <span className="text-xs text-slate-600">—</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Demonstrated concepts */}
      {uniqueConcepts.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-success-400 mb-3">Concepts You Demonstrated</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueConcepts.map(c => (
              <span key={c} className="px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400 text-xs border border-success-500/20">
                {c}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onNewInterview} leftIcon={<RotateCcw />} className="flex-1">
          New Interview
        </Button>
        <Button onClick={onDashboard} rightIcon={<Home />} className="flex-1">
          Dashboard
        </Button>
      </div>
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
