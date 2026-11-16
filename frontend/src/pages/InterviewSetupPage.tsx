import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Briefcase, BookOpen, Gauge, Hash, Layers, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useAppStore } from '@/store/useAppStore'
import { getQuestions } from '@/data/questions'
import {
  generateId, TOPIC_LABELS, TOPIC_COLORS, DIFFICULTY_COLORS, PERSONALITY_CONFIGS,
} from '@/lib/utils'
import type {
  InterviewSetupForm, InterviewSession, SessionQuestion, TopicKey, InterviewerPersonality,
} from '@/types'

const TOPIC_OPTIONS = [
  { value: 'java', label: 'Java' },
  { value: 'dsa', label: 'Data Structures & Algorithms' },
  { value: 'dbms', label: 'Database Management (DBMS)' },
  { value: 'os', label: 'Operating Systems' },
  { value: 'networks', label: 'Computer Networks' },
  { value: 'behavioral', label: 'HR & Behavioral' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy — Fundamentals' },
  { value: 'medium', label: 'Medium — Core concepts' },
  { value: 'hard', label: 'Hard — Advanced topics' },
]

const TYPE_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'mixed', label: 'Mixed' },
]

const COUNT_OPTIONS = [
  { value: '3', label: '3 questions (~10 min)' },
  { value: '5', label: '5 questions (~20 min)' },
  { value: '8', label: '8 questions (~30 min)' },
]

const ROLE_SUGGESTIONS = [
  'Software Engineer', 'Backend Developer', 'Frontend Developer',
  'Full Stack Developer', 'Data Engineer', 'DevOps Engineer',
]

type FormErrors = Partial<Record<keyof InterviewSetupForm, string>>

export function InterviewSetupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile, setActiveSession, saveSession } = useAppStore()

  const [form, setForm] = useState<InterviewSetupForm>({
    role: profile?.targetRole ?? 'Software Engineer',
    topic: (searchParams.get('topic') as TopicKey) ?? 'java',
    difficulty: 'medium',
    questionCount: 5,
    interviewType: 'technical',
    personality: 'friendly_mentor',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = searchParams.get('topic') as TopicKey | null
    if (t) setForm(f => ({ ...f, topic: t }))
  }, [searchParams])

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.role.trim()) e.role = 'Please enter your target role.'
    if (!form.topic) e.topic = 'Please select a topic.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleChange<K extends keyof InterviewSetupForm>(key: K, value: InterviewSetupForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  async function handleStart() {
    if (!validate()) return
    setLoading(true)
    setError(null)

    try {
      const questions = getQuestions({
        topic: form.topic,
        difficulty: form.difficulty,
        type: form.interviewType,
        count: form.questionCount,
      })

      if (questions.length === 0) {
        setError('No questions found for the selected combination. Try changing difficulty or type.')
        setLoading(false)
        return
      }

      const userId = profile?.id ?? 'local-user'
      const sessionId = generateId()

      const sessionQuestions: SessionQuestion[] = questions.map((q, i) => ({
        id: generateId(),
        sessionId,
        questionId: q.id,
        question: q,
        answer: null,
        evaluation: null,
        orderIndex: i,
      }))

      const session: InterviewSession = {
        id: sessionId,
        userId,
        role: form.role,
        topic: form.topic,
        difficulty: form.difficulty,
        interviewType: form.interviewType,
        personality: form.personality,
        questionCount: questions.length,
        status: 'in_progress',
        overallScore: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        questions: sessionQuestions,
      }

      saveSession(session)
      setActiveSession(session)
      navigate(`/interview/${sessionId}`)
    } catch (err) {
      setError('Failed to set up interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedTopic = form.topic
  const topicColor = TOPIC_COLORS[selectedTopic]

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Configure Your Interview</h1>
        <p className="text-slate-400">Customize the session to match your target role and current focus.</p>
      </div>

      <div className="space-y-5">
        {/* Target role */}
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <Briefcase className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Target Role
            </CardTitle>
          </CardHeader>
          <Input
            value={form.role}
            onChange={e => handleChange('role', e.target.value)}
            placeholder="e.g. Software Engineer"
            error={errors.role}
            aria-label="Target role"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {ROLE_SUGGESTIONS.map(r => (
              <button
                key={r}
                onClick={() => handleChange('role', r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  form.role === r
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        {/* Topic */}
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <BookOpen className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Topic
            </CardTitle>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: topicColor }}
              aria-hidden="true"
            />
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOPIC_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange('topic', opt.value as TopicKey)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                  form.topic === opt.value
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                }`}
                aria-pressed={form.topic === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.topic && <p className="text-xs text-danger-400 mt-2">{errors.topic}</p>}
        </Card>

        {/* Difficulty + Type */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle as="h2">
                <Gauge className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
                Difficulty
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-2">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('difficulty', opt.value as 'easy' | 'medium' | 'hard')}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all text-left ${
                    form.difficulty === opt.value
                      ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                  aria-pressed={form.difficulty === opt.value}
                >
                  <Badge
                    size="sm"
                    className={`mr-1.5 ${DIFFICULTY_COLORS[opt.value as 'easy' | 'medium' | 'hard']}`}
                  >
                    {opt.value}
                  </Badge>
                  {opt.label.split('—')[1].trim()}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">
                <Layers className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
                Interview Type
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('interviewType', opt.value as 'technical' | 'behavioral' | 'mixed')}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all text-left ${
                    form.interviewType === opt.value
                      ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                  aria-pressed={form.interviewType === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Question count */}
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <Hash className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Number of Questions
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-2">
            {COUNT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange('questionCount', Number(opt.value))}
                className={`px-3 py-2.5 rounded-xl text-sm border transition-all text-center ${
                  form.questionCount === Number(opt.value)
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
                aria-pressed={form.questionCount === Number(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Personality picker */}
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <Users className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Interviewer Personality
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(PERSONALITY_CONFIGS).map(p => {
              const isSelected = form.personality === p.id
              return (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange('personality', p.id as InterviewerPersonality)}
                  aria-pressed={isSelected}
                  className={`flex items-start gap-3 px-3.5 py-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-white/[0.06] bg-navy-800/40 hover:border-white/[0.12]'
                  }`}
                >
                  <span className="text-xl mt-0.5 shrink-0">{p.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-violet-300' : 'text-slate-200'}`}>
                        {p.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.traits.map(t => (
                        <span key={t} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500 border border-white/[0.05]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </Card>

        {/* Summary */}
        <div className="flex flex-wrap gap-2 text-sm text-slate-400">
          <span>Practicing:</span>
          <Badge variant="purple">{TOPIC_LABELS[form.topic]}</Badge>
          <Badge variant="default">{form.difficulty}</Badge>
          <Badge variant="default">{form.interviewType}</Badge>
          <Badge variant="default">{form.questionCount} questions</Badge>
          <span className="flex items-center gap-1">
            {PERSONALITY_CONFIGS[form.personality].icon}
            <span className="text-xs text-slate-400">{PERSONALITY_CONFIGS[form.personality].name}</span>
          </span>
        </div>

        {error && <ErrorMessage message={error} onRetry={handleStart} />}

        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
          loading={loading}
          rightIcon={<ChevronRight />}
        >
          Start Interview
        </Button>
      </div>
    </div>
  )
}
