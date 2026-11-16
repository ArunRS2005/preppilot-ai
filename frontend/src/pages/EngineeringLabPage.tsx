/**
 * Engineering Lab — Three tracks:
 * A. Coding Interview: Monaco editor, problems, approach explanation + AI evaluation
 * B. Debugging Challenge: Find bugs in provided code, explain reasoning
 * C. System Design: Architecture canvas (node-based), AI feedback on approach
 *
 * No arbitrary code is executed on the server. Users write explanations of
 * their approach; the Monaco editor is for reference and thinking.
 * AI evaluates the reasoning text, not code output.
 */

import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, Bug, Layout, ChevronDown, ChevronUp,
  Lightbulb, CheckCircle, AlertTriangle, Zap, RotateCcw,
  Eye, EyeOff, Target, Info,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Input'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FadeInView, StaggeredList, StaggerItem } from '@/components/ui/motion'
import { mockEvaluate } from '@/lib/mockEvaluate'
import { cn } from '@/lib/utils'
import {
  CODING_CHALLENGES, DEBUGGING_CHALLENGES, SYSTEM_DESIGN_CHALLENGES,
  type CodingChallenge, type DebuggingChallenge, type SystemDesignChallenge,
  type LabTrack, type LabDifficulty,
} from '@/data/labChallenges'

// Lazy-load Monaco to keep initial bundle small
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

// ─── Types ────────────────────────────────────────────────────────────────────

interface LabEvaluation {
  overallScore: number
  technicalScore: number
  clarityScore: number
  completenessScore: number
  strengths: string[]
  improvements: string[]
  isMock: boolean
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function EngineeringLabPage() {
  const [activeTrack, setActiveTrack] = useState<LabTrack>('coding')
  const [difficultyFilter, setDifficultyFilter] = useState<LabDifficulty | 'all'>('all')

  const tracks: Array<{ id: LabTrack; label: string; icon: React.ElementType; color: string; count: number; description: string }> = [
    { id: 'coding', label: 'Coding', icon: Code2, color: '#8b5cf6', count: CODING_CHALLENGES.length, description: 'Algorithm & data structure problems with a code editor' },
    { id: 'debugging', label: 'Debugging', icon: Bug, color: '#f59e0b', count: DEBUGGING_CHALLENGES.length, description: 'Find and explain bugs in provided code' },
    { id: 'system_design', label: 'System Design', icon: Layout, color: '#06b6d4', count: SYSTEM_DESIGN_CHALLENGES.length, description: 'Architecture challenges with AI feedback on your approach' },
  ]

  const difficulties: Array<{ id: LabDifficulty | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ]

  const activeChallenges = (() => {
    let pool = activeTrack === 'coding' ? CODING_CHALLENGES
      : activeTrack === 'debugging' ? DEBUGGING_CHALLENGES
      : SYSTEM_DESIGN_CHALLENGES
    if (difficultyFilter !== 'all') pool = pool.filter(c => c.difficulty === difficultyFilter) as typeof pool
    return pool
  })()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeInView className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-bold text-white">Engineering Lab</h1>
          <Badge variant="purple" size="sm">Beta</Badge>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl">
          Practice coding problems, find bugs in real code, and design systems. 
          AI evaluates your reasoning and approach — not just the final answer.
        </p>
      </FadeInView>

      {/* Track selector */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {tracks.map(track => (
          <motion.button
            key={track.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTrack(track.id)}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl border text-left transition-all',
              activeTrack === track.id
                ? 'border-violet-500/40 bg-violet-500/10'
                : 'border-white/[0.06] bg-navy-800/50 hover:border-white/[0.1]'
            )}
          >
            <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${track.color}18` }}>
              <track.icon className="h-5 w-5" style={{ color: track.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${activeTrack === track.id ? 'text-violet-300' : 'text-white'}`}>
                  {track.label}
                </span>
                <Badge variant="default" size="sm">{track.count}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{track.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-slate-500">Difficulty:</span>
        {difficulties.map(d => (
          <button
            key={d.id}
            onClick={() => setDifficultyFilter(d.id)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
              difficultyFilter === d.id
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                : 'border-white/[0.05] text-slate-500 hover:text-slate-300 hover:border-white/[0.1]'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Challenge list */}
      {activeChallenges.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No challenges match the selected filters.</div>
      ) : (
        <StaggeredList className="space-y-4">
          {activeTrack === 'coding' && (activeChallenges as CodingChallenge[]).map(c => (
            <StaggerItem key={c.id}>
              <CodingChallengeCard challenge={c} />
            </StaggerItem>
          ))}
          {activeTrack === 'debugging' && (activeChallenges as DebuggingChallenge[]).map(c => (
            <StaggerItem key={c.id}>
              <DebuggingChallengeCard challenge={c} />
            </StaggerItem>
          ))}
          {activeTrack === 'system_design' && (activeChallenges as SystemDesignChallenge[]).map(c => (
            <StaggerItem key={c.id}>
              <SystemDesignCard challenge={c} />
            </StaggerItem>
          ))}
        </StaggeredList>
      )}
    </div>
  )
}

// ─── Shared difficulty badge ───────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: LabDifficulty }) {
  const styles = {
    easy:   'bg-success-500/10 text-success-400 border-success-500/20',
    medium: 'bg-warning-500/10 text-warning-400 border-warning-500/20',
    hard:   'bg-danger-500/10  text-danger-400  border-danger-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${styles[difficulty]}`}>
      {difficulty}
    </span>
  )
}

// ─── Shared evaluation logic ───────────────────────────────────────────────────

async function evaluateApproach(
  question: string,
  answer: string,
  topic: string,
): Promise<LabEvaluation> {
  // Try backend first
  try {
    const { apiClient, isBackendAvailable } = await import('@/lib/api')
    if (await isBackendAvailable()) {
      const res = await apiClient.evaluate({
        sessionId: 'lab-' + Date.now(),
        questionId: 'lab',
        questionText: question,
        answerText: answer,
        topic: topic as import('@/types').TopicKey,
        difficulty: 'medium',
      })
      const ev = res.evaluation
      return {
        overallScore: ev.overallScore,
        technicalScore: ev.technicalScore,
        clarityScore: ev.clarityScore,
        completenessScore: ev.completenessScore,
        strengths: ev.strengths,
        improvements: ev.improvements,
        isMock: res.isMock,
      }
    }
  } catch { /* fall through */ }
  // Mock fallback
  const ev = mockEvaluate({ questionText: question, answerText: answer, topic: 'dsa', difficulty: 'medium', concepts: [] })
  return {
    overallScore: ev.overallScore,
    technicalScore: ev.technicalScore,
    clarityScore: ev.clarityScore,
    completenessScore: ev.completenessScore,
    strengths: ev.strengths,
    improvements: ev.improvements,
    isMock: true,
  }
}

// ─── Coding challenge card ────────────────────────────────────────────────────

function CodingChallengeCard({ challenge: c }: { challenge: CodingChallenge }) {
  const [expanded, setExpanded] = useState(false)
  const [language, setLanguage] = useState<string>('java')
  const [code, setCode] = useState(c.starterCode[language] ?? '')
  const [explanation, setExplanation] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [hintIdx, setHintIdx] = useState(0)
  const [evaluation, setEvaluation] = useState<LabEvaluation | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(c.starterCode[lang] ?? '')
  }

  const handleEvaluate = async () => {
    if (!explanation.trim()) return
    setEvaluating(true)
    const q = `${c.title}: ${c.description}\n\nExamples: ${c.examples.map(e => `Input: ${e.input} → Output: ${e.output}`).join('; ')}`
    const a = `My approach and solution explanation:\n${explanation}\n\nMy code:\n${code}`
    const ev = await evaluateApproach(q, a, 'dsa')
    setEvaluation(ev)
    setEvaluating(false)
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Code2 className="h-4 w-4 text-violet-400 shrink-0" />
            <span className="text-sm font-semibold text-white">{c.title}</span>
            <DifficultyBadge difficulty={c.difficulty} />
            {c.tags.map(t => (
              <span key={t} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500 border border-white/[0.05]">{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Time: {c.timeComplexity}</span>
            <span>Space: {c.spaceComplexity}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-1" />}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 space-y-5 border-t border-white/[0.05] pt-5">
              {/* Problem description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Problem</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{c.description}</p>
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Constraints</h3>
                <ul className="space-y-1">
                  {c.constraints.map((ct, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-violet-400 shrink-0 mt-0.5">·</span>{ct}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Examples</h3>
                <div className="space-y-2">
                  {c.examples.map((ex, i) => (
                    <div key={i} className="p-3 rounded-xl bg-navy-900/60 border border-white/[0.05] font-mono text-xs space-y-1">
                      <div><span className="text-slate-500">Input:</span> <span className="text-white">{ex.input}</span></div>
                      <div><span className="text-slate-500">Output:</span> <span className="text-success-400">{ex.output}</span></div>
                      {ex.explanation && <div className="text-slate-500">{ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Language selector + Monaco editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Code Editor</h3>
                  <div className="flex gap-1">
                    {Object.keys(c.starterCode).map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                          language === lang
                            ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                            : 'border-white/[0.05] text-slate-500 hover:text-slate-300'
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/[0.08]" style={{ height: '280px' }}>
                  <Suspense fallback={<div className="h-full flex items-center justify-center bg-navy-900"><LoadingSpinner size="md" label="Loading editor…" /></div>}>
                    <MonacoEditor
                      height="280px"
                      language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : 'java'}
                      value={code}
                      onChange={v => setCode(v ?? '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        folding: false,
                        padding: { top: 12, bottom: 12 },
                        fontFamily: 'JetBrains Mono, Fira Code, monospace',
                        wordWrap: 'on',
                      }}
                    />
                  </Suspense>
                </div>
                <p className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  Code is not executed. Write your approach explanation below and get AI feedback on your reasoning.
                </p>
              </div>

              {/* Hint */}
              <div>
                <button
                  onClick={() => { setShowHint(true); setHintIdx(i => Math.min(i + 1, c.hints.length - 1)) }}
                  className="flex items-center gap-2 text-xs text-warning-400 hover:text-warning-300 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {showHint ? `Hint ${hintIdx + 1}/${c.hints.length}` : 'Show hint'}
                </button>
                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-warning-500/5 border border-warning-500/15">
                    <p className="text-xs text-warning-300">{c.hints[hintIdx]}</p>
                  </div>
                )}
              </div>

              {/* Explanation + evaluation */}
              <div>
                <Textarea
                  label="Explain your approach and solution"
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="Describe your algorithm, its time and space complexity, edge cases you handle, and why you chose this approach…"
                  rows={5}
                />
                <Button
                  className="mt-3"
                  onClick={handleEvaluate}
                  disabled={!explanation.trim()}
                  loading={evaluating}
                  leftIcon={<Zap />}
                >
                  Evaluate My Approach
                </Button>
              </div>

              {/* Evaluation result */}
              {evaluation && <EvaluationResult evaluation={evaluation} onReset={() => { setEvaluation(null); setExplanation('') }} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ─── Debugging challenge card ─────────────────────────────────────────────────

function DebuggingChallengeCard({ challenge: c }: { challenge: DebuggingChallenge }) {
  const [expanded, setExpanded] = useState(false)
  const [userExplanation, setUserExplanation] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [evaluation, setEvaluation] = useState<LabEvaluation | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  const handleSubmit = async () => {
    if (!userExplanation.trim()) return
    setEvaluating(true)
    setSubmitted(true)
    const q = `Debugging challenge: ${c.title}\n\nBuggy code:\n${c.buggyCode}\n\nSymptoms: ${c.symptoms.join('; ')}\n\nTask: Identify and explain the bug(s).`
    const ev = await evaluateApproach(q, userExplanation, 'java')
    setEvaluation(ev)
    setEvaluating(false)
  }

  const handleReset = () => {
    setUserExplanation('')
    setSubmitted(false)
    setShowAnswer(false)
    setEvaluation(null)
  }

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Bug className="h-4 w-4 text-warning-400 shrink-0" />
            <span className="text-sm font-semibold text-white">{c.title}</span>
            <DifficultyBadge difficulty={c.difficulty} />
            <Badge variant="default" size="sm">{c.language}</Badge>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 space-y-5 border-t border-white/[0.05] pt-5">
              <p className="text-sm text-slate-300">{c.description}</p>

              {/* Symptoms */}
              <div className="p-3 rounded-xl bg-danger-500/5 border border-danger-500/15">
                <p className="text-xs font-semibold text-danger-400 mb-1.5">Observed symptoms:</p>
                <ul className="space-y-1">
                  {c.symptoms.map((s, i) => (
                    <li key={i} className="text-xs text-danger-300 flex items-start gap-1.5">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buggy code */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Code to Debug</h3>
                <div className="rounded-xl overflow-hidden border border-white/[0.08]" style={{ height: '220px' }}>
                  <Suspense fallback={<div className="h-full flex items-center justify-center bg-navy-900"><LoadingSpinner size="sm" /></div>}>
                    <MonacoEditor
                      height="220px"
                      language={c.language}
                      value={c.buggyCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true, fontSize: 13, minimap: { enabled: false },
                        scrollBeyondLastLine: false, lineNumbers: 'on',
                        padding: { top: 12, bottom: 12 },
                        fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      }}
                    />
                  </Suspense>
                </div>
              </div>

              {/* User explanation */}
              {!submitted ? (
                <>
                  <Textarea
                    label="Identify and explain the bug(s)"
                    value={userExplanation}
                    onChange={e => setUserExplanation(e.target.value)}
                    placeholder="Which line(s) contain the bug? What is wrong? Why does it cause the symptom? What is the fix?"
                    rows={5}
                  />
                  <Button onClick={handleSubmit} disabled={!userExplanation.trim()} loading={evaluating} leftIcon={<Bug />}>
                    Submit Explanation
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {evaluating && <LoadingSpinner size="md" label="Evaluating your answer…" />}
                  {evaluation && <EvaluationResult evaluation={evaluation} onReset={handleReset} />}

                  {/* Show answer toggle */}
                  <button
                    onClick={() => setShowAnswer(v => !v)}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showAnswer ? 'Hide explanation' : 'Show full explanation & fix'}
                  </button>

                  <AnimatePresence>
                    {showAnswer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-success-500/5 border border-success-500/20">
                            <h3 className="text-xs font-semibold text-success-400 mb-2 flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" />Bug Explanation
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{c.bugDescription}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Fixed Code</h3>
                            <div className="rounded-xl overflow-hidden border border-success-500/20" style={{ height: '200px' }}>
                              <Suspense fallback={<div className="h-full bg-navy-900" />}>
                                <MonacoEditor
                                  height="200px"
                                  language={c.language}
                                  value={c.fixedCode}
                                  theme="vs-dark"
                                  options={{ readOnly: true, fontSize: 13, minimap: { enabled: false }, lineNumbers: 'on', padding: { top: 12 }, fontFamily: 'JetBrains Mono, monospace' }}
                                />
                              </Suspense>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ─── System design card ───────────────────────────────────────────────────────

function SystemDesignCard({ challenge: c }: { challenge: SystemDesignChallenge }) {
  const [expanded, setExpanded] = useState(false)
  const [approach, setApproach] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [evaluation, setEvaluation] = useState<LabEvaluation | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  const handleEvaluate = async () => {
    if (!approach.trim()) return
    setEvaluating(true)
    const q = `System Design: ${c.title}\n\nScenario: ${c.scenario}\n\nRequirements: ${c.requirements.join('; ')}\n\nConstraints: ${c.constraints.join('; ')}\n\nEvaluation criteria: ${c.evaluationCriteria.join('; ')}`
    const ev = await evaluateApproach(q, approach, 'networks')
    setEvaluation(ev)
    setEvaluating(false)
  }

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Layout className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-sm font-semibold text-white">{c.title}</span>
            <DifficultyBadge difficulty={c.difficulty} />
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{c.scenario}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 space-y-5 border-t border-white/[0.05] pt-5">
              <p className="text-sm text-slate-300 leading-relaxed">{c.scenario}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Functional Requirements</h3>
                  <ul className="space-y-1.5">
                    {c.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="h-3 w-3 text-success-400 shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Constraints</h3>
                  <ul className="space-y-1.5">
                    {c.constraints.map((ct, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Target className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />{ct}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Evaluation Criteria</h3>
                <ul className="space-y-1">
                  {c.evaluationCriteria.map((cr, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-violet-400 shrink-0">·</span>{cr}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hints */}
              <div>
                <button onClick={() => setShowHints(v => !v)} className="flex items-center gap-2 text-xs text-warning-400 hover:text-warning-300">
                  <Lightbulb className="h-3.5 w-3.5" />
                  {showHints ? 'Hide guiding questions' : 'Show guiding questions'}
                </button>
                <AnimatePresence>
                  {showHints && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-2">
                      <ul className="space-y-1.5 p-3 rounded-xl bg-warning-500/5 border border-warning-500/15">
                        {c.hints.map((h, i) => (
                          <li key={i} className="text-xs text-warning-300 flex items-start gap-2">
                            <span className="shrink-0">?</span>{h}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Textarea
                label="Describe your architecture and design decisions"
                value={approach}
                onChange={e => setApproach(e.target.value)}
                placeholder={`Walk through your design. Cover:\n• Core components and their responsibilities\n• Data flow between components\n• Database and storage choices\n• How you handle the scale requirements\n• Trade-offs you made and why\n• What you'd improve with more time`}
                rows={10}
              />

              <Button
                onClick={handleEvaluate}
                disabled={!approach.trim()}
                loading={evaluating}
                leftIcon={<Zap />}
              >
                Evaluate My Design
              </Button>

              {evaluation && <EvaluationResult evaluation={evaluation} onReset={() => { setEvaluation(null); setApproach('') }} />}

              {/* Key components reference */}
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                <h3 className="text-xs font-semibold text-indigo-400 mb-2">Key components typically covered:</h3>
                <div className="flex flex-wrap gap-1.5">
                  {c.keyComponents.map(comp => (
                    <span key={comp} className="text-2xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{comp}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ─── Shared evaluation result ─────────────────────────────────────────────────

function EvaluationResult({ evaluation: ev, onReset }: { evaluation: LabEvaluation; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {ev.isMock && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-500/10 border border-warning-500/20">
          <AlertTriangle className="h-4 w-4 text-warning-400 shrink-0" />
          <p className="text-xs text-warning-300"><strong>Mock evaluation</strong> — backend unavailable. Scores are heuristic estimates.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <ScoreRing score={ev.overallScore} size="md" showGlow />
        <div className="flex-1 w-full space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Score Breakdown</h3>
          {[
            { label: 'Technical Correctness', val: ev.technicalScore },
            { label: 'Completeness', val: ev.completenessScore },
            { label: 'Clarity', val: ev.clarityScore },
          ].map(d => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-36 shrink-0">{d.label}</span>
              <div className="flex-1"><ProgressBar value={d.val} size="sm" color="auto" animated /></div>
              <span className="text-xs text-white w-7 text-right num">{d.val}%</span>
            </div>
          ))}
        </div>
      </div>

      {ev.strengths.length > 0 && (
        <div className="p-4 rounded-xl bg-success-500/5 border border-success-500/15">
          <h3 className="text-xs font-semibold text-success-400 mb-2 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />Strengths
          </h3>
          <ul className="space-y-1">
            {ev.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-success-400 shrink-0">·</span>{s}</li>)}
          </ul>
        </div>
      )}

      {ev.improvements.length > 0 && (
        <div className="p-4 rounded-xl bg-warning-500/5 border border-warning-500/15">
          <h3 className="text-xs font-semibold text-warning-400 mb-2 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />Improvements
          </h3>
          <ul className="space-y-1">
            {ev.improvements.map((s, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-warning-400 shrink-0">·</span>{s}</li>)}
          </ul>
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<RotateCcw />}>
        Try Again
      </Button>
    </motion.div>
  )
}
