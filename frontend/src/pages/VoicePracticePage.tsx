/**
 * Communication Intelligence — Voice Practice
 *
 * Uses native browser APIs:
 * - MediaRecorder: record spoken answers (with explicit mic permission)
 * - Web Speech API (SpeechRecognition): live transcription
 *
 * Metrics computed client-side from the transcript:
 * - Speaking pace (words per minute)
 * - Pause count and distribution
 * - Filler word frequency
 * - Answer structure (intro, examples, conclusion markers)
 *
 * Technical correctness is scored by sending the transcript to the
 * evaluation endpoint — separate from delivery metrics.
 *
 * No emotion, confidence, or personality inference.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, Square, Trash2, Zap,
  Activity, Gauge, Clock, TrendingUp, AlertTriangle,
  Volume2, Info,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { FadeInView } from '@/components/ui/motion'
import { mockEvaluate } from '@/lib/mockEvaluate'
import { getQuestions } from '@/data/questions'
import { cn } from '@/lib/utils'
import type { TopicKey } from '@/types'

// ─── Filler words ────────────────────────────────────────────────────────────

const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'basically',
  'actually', 'literally', 'kind of', 'sort of', 'right', 'so yeah',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface VoiceMetrics {
  wpm: number
  duration: number          // seconds
  wordCount: number
  pauseCount: number
  fillerWordCount: number
  fillerWords: string[]
  structureMarkers: {
    hasIntro: boolean
    hasExample: boolean
    hasConclusion: boolean
  }
}

interface TechEvaluation {
  overallScore: number
  strengths: string[]
  improvements: string[]
  isMock: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function analyzeTranscript(transcript: string, durationSec: number): VoiceMetrics {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const wpm = durationSec > 0 ? Math.round((wordCount / durationSec) * 60) : 0
  const lower = transcript.toLowerCase()

  const fillerWords = FILLER_WORDS.filter(f => lower.includes(f))
  const fillerWordCount = fillerWords.reduce((count, f) => {
    const regex = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    return count + (transcript.match(regex)?.length ?? 0)
  }, 0)

  // Simple pause detection: long gaps between sentence boundaries
  const sentenceBoundaries = (transcript.match(/[.!?]+\s*/g) ?? []).length
  // Rough estimate: pauses ≥ 0.5s are hard to detect from text alone;
  // use sentence count as a proxy for natural rhythm
  const pauseCount = Math.max(0, sentenceBoundaries - 1)

  const structureMarkers = {
    hasIntro: /\b(hi|i'm|i am|my name|let me|i'll start|to begin)\b/i.test(transcript),
    hasExample: /\b(for example|for instance|like when|in my|one time|a project)\b/i.test(transcript),
    hasConclusion: /\b(in summary|to summarize|overall|in conclusion|so that|finally|to wrap up)\b/i.test(transcript),
  }

  return { wpm, duration: durationSec, wordCount, pauseCount, fillerWordCount, fillerWords, structureMarkers }
}

function getPaceRating(wpm: number): { label: string; color: string } {
  if (wpm === 0) return { label: 'No data', color: 'text-slate-500' }
  if (wpm < 100) return { label: 'Slow — may lose interviewer attention', color: 'text-warning-400' }
  if (wpm > 180) return { label: 'Fast — may sound rushed', color: 'text-warning-400' }
  return { label: 'Good pace', color: 'text-success-400' }
}

function getFillerRating(count: number, wordCount: number): { label: string; color: string } {
  const ratio = wordCount > 0 ? count / wordCount : 0
  if (ratio === 0) return { label: 'None detected', color: 'text-success-400' }
  if (ratio < 0.02) return { label: 'Minimal', color: 'text-success-400' }
  if (ratio < 0.05) return { label: 'Some', color: 'text-warning-400' }
  return { label: 'Frequent — try to reduce', color: 'text-danger-400' }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function VoicePracticePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState<TopicKey>('behavioral')
  const [question, setQuestion] = useState(() => getQuestions({ topic: 'behavioral', count: 1 })[0])

  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [metrics, setMetrics] = useState<VoiceMetrics | null>(null)
  const [techEval, setTechEval] = useState<TechEvaluation | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'unsupported'>('unknown')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptRef = useRef('')

  // Check browser support and existing permissions
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState('unsupported')
      return
    }
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((p) => { if (p.state === 'denied') setPermissionState('denied') })
        .catch(() => {})
    }
  }, [])

  const newQuestion = () => {
    const q = getQuestions({ topic, count: 1 })[0]
    if (q) setQuestion(q)
    resetSession()
  }

  const resetSession = () => {
    setTranscript('')
    setInterimTranscript('')
    setMetrics(null)
    setTechEval(null)
    setError(null)
    setDuration(0)
    transcriptRef.current = ''
    audioChunksRef.current = []
  }

  const startRecording = async () => {
    setError(null)
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setPermissionState('unsupported'); return }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionState('granted')

      // Set up MediaRecorder (audio capture for waveform/visual, not stored)
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()) }
      mr.start()
      mediaRecorderRef.current = mr

      // Set up speech recognition
      const recognition = new SR()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript + ' '
          } else {
            interim += result[0].transcript
          }
        }
        if (final) {
          transcriptRef.current += final
          setTranscript(transcriptRef.current)
        }
        setInterimTranscript(interim)
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow access in your browser settings.')
          setPermissionState('denied')
          stopRecording()
        } else if (event.error === 'no-speech') {
          // Ignore — recognition will continue
        } else {
          setError(`Transcription error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        // If still recording, restart (Chrome stops after silence)
        if (mediaRecorderRef.current?.state === 'recording') {
          try { recognition.start() } catch { /* already started */ }
        }
      }

      recognition.start()
      recognitionRef.current = recognition

      // Start timer
      setDuration(0)
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)

      setRecording(true)
    } catch (err) {
      setError('Could not access microphone. Please grant permission and try again.')
      setPermissionState('denied')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* */ }
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
    setInterimTranscript('')

    // Compute metrics
    const finalText = transcriptRef.current.trim()
    if (finalText && duration > 0) {
      setMetrics(analyzeTranscript(finalText, duration))
    }
  }

  const evaluateAnswer = async () => {
    if (!transcriptRef.current.trim()) return
    setEvaluating(true)
    try {
      // Try backend
      const { apiClient, isBackendAvailable } = await import('@/lib/api')
      if (await isBackendAvailable()) {
        const res = await apiClient.evaluate({
          sessionId: 'voice-' + Date.now(),
          questionId: question.id,
          questionText: question.text,
          answerText: transcriptRef.current,
          topic: question.topic,
          difficulty: question.difficulty,
        })
        setTechEval({
          overallScore: res.evaluation.overallScore,
          strengths: res.evaluation.strengths,
          improvements: res.evaluation.improvements,
          isMock: res.isMock,
        })
      } else {
        throw new Error('backend unavailable')
      }
    } catch {
      // Mock fallback
      const ev = mockEvaluate({
        questionText: question.text,
        answerText: transcriptRef.current,
        topic: question.topic,
        difficulty: question.difficulty,
        concepts: question.concepts,
      })
      setTechEval({
        overallScore: ev.overallScore,
        strengths: ev.strengths,
        improvements: ev.improvements,
        isMock: true,
      })
    } finally {
      setEvaluating(false)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ─── Unsupported state ──────────────────────────────────────────────────────
  if (permissionState === 'unsupported') {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <EmptyState
          icon={<Mic className="h-8 w-8" />}
          title="Voice practice not supported"
          description="Your browser doesn't support the Speech Recognition API. Try Chrome, Edge, or Safari."
          action={{ label: 'Back to Dashboard', onClick: () => navigate('/dashboard') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeInView className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mic className="h-5 w-5 text-violet-400" />
              <h1 className="text-2xl font-bold text-white">Voice Practice</h1>
              <Badge variant="purple" size="sm">Beta</Badge>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Practice answering aloud. We measure delivery — pace, pauses, filler words — separately from technical correctness.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={topic}
              onChange={e => { setTopic(e.target.value as TopicKey); resetSession() }}
              className="bg-navy-800 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              {['behavioral', 'java', 'dsa', 'dbms', 'os', 'networks'].map(t => (
                <option key={t} value={t} className="bg-navy-900">{t.toUpperCase()}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" onClick={newQuestion} leftIcon={<Zap />}>
              New Question
            </Button>
          </div>
        </div>
      </FadeInView>

      {/* Privacy notice */}
      <div className="mb-6 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-2">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Audio is processed locally in your browser and is <strong className="text-indigo-300">never uploaded or stored</strong>.
          Only the transcript text is sent to the evaluation endpoint. You can delete the recording at any time.
          We do not infer confidence, personality, or emotion from voice.
        </p>
      </div>

      {/* Question card */}
      <Card className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold shrink-0">
            Q
          </div>
          <div>
            <p className="text-xs text-violet-400 uppercase tracking-wide mb-1">{question.topic.toUpperCase()} · {question.difficulty}</p>
            <h2 className="text-base font-medium text-white leading-relaxed">{question.text}</h2>
          </div>
        </div>
      </Card>

      {/* Recording controls */}
      <Card className="mb-6">
        <div className="flex flex-col items-center gap-5">
          {/* Mic button */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {recording ? (
                <motion.button
                  key="recording"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={stopRecording}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-danger-500/20 border-2 border-danger-500/40 text-danger-400 hover:bg-danger-500/30 transition-colors relative"
                  aria-label="Stop recording"
                >
                  <span className="absolute inset-0 rounded-full bg-danger-500/20 animate-ping-slow" />
                  <Square className="h-7 w-7" fill="currentColor" />
                </motion.button>
              ) : (
                <motion.button
                  key="idle"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={startRecording}
                  disabled={permissionState === 'denied'}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/20 border-2 border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition-colors disabled:opacity-40"
                  aria-label="Start recording"
                >
                  <Mic className="h-8 w-8" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Timer / status */}
          <div className="text-center">
            {recording ? (
              <div className="flex items-center gap-2 text-danger-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
                </span>
                <span className="font-mono text-lg num">{formatTime(duration)}</span>
                <span className="text-xs">Recording…</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {permissionState === 'denied' ? 'Microphone access denied' : 'Click the mic to start'}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-danger-400">
              <AlertTriangle className="h-3.5 w-3.5" />{error}
            </div>
          )}
        </div>
      </Card>

      {/* Live transcript */}
      {(transcript || interimTranscript || recording) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Live Transcript</CardTitle>
            {transcript && (
              <Button variant="ghost" size="xs" onClick={resetSession} leftIcon={<Trash2 />}>
                Clear
              </Button>
            )}
          </CardHeader>
          <div className="min-h-[80px] p-4 rounded-xl bg-navy-900/60 border border-white/[0.05]">
            <p className="text-sm text-slate-300 leading-relaxed">
              {transcript}
              <span className="text-slate-500 italic">{interimTranscript}</span>
              {!transcript && !interimTranscript && (
                <span className="text-slate-600">Start speaking — your words will appear here…</span>
              )}
            </p>
          </div>
        </Card>
      )}

      {/* Results */}
      {metrics && (
        <div className="space-y-5">
          {/* Delivery metrics */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Volume2 className="inline h-4 w-4 text-cyan-400 mr-2" />
                Delivery Metrics
              </CardTitle>
            </CardHeader>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <MetricCard icon={<Gauge />} label="Speaking Pace" value={`${metrics.wpm} wpm`} rating={getPaceRating(metrics.wpm)} color="#06b6d4" />
              <MetricCard icon={<Clock />} label="Duration" value={formatTime(metrics.duration)} rating={{ label: `${metrics.wordCount} words`, color: 'text-slate-400' }} color="#6366f1" />
              <MetricCard icon={<Activity />} label="Filler Words" value={`${metrics.fillerWordCount}`} rating={getFillerRating(metrics.fillerWordCount, metrics.wordCount)} color="#f59e0b" />
            </div>

            {/* Filler words found */}
            {metrics.fillerWords.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Filler words detected:</p>
                <div className="flex flex-wrap gap-1.5">
                  {metrics.fillerWords.map(w => (
                    <span key={w} className="px-2 py-1 rounded-lg bg-warning-500/10 text-warning-400 text-xs border border-warning-500/20">
                      "{w}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Structure */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Answer structure:</p>
              <div className="grid grid-cols-3 gap-2">
                <StructureMarker label="Intro" active={metrics.structureMarkers.hasIntro} />
                <StructureMarker label="Example" active={metrics.structureMarkers.hasExample} />
                <StructureMarker label="Conclusion" active={metrics.structureMarkers.hasConclusion} />
              </div>
            </div>
          </Card>

          {/* Technical evaluation trigger */}
          {!techEval && !evaluating && (
            <Button className="w-full" onClick={evaluateAnswer} leftIcon={<Zap />} size="lg">
              Evaluate Technical Content
            </Button>
          )}

          {evaluating && (
            <Card className="flex flex-col items-center gap-4 py-10">
              <LoadingSpinner size="md" label="Evaluating your answer…" />
            </Card>
          )}

          {techEval && (
            <>
              {techEval.isMock && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-500/10 border border-warning-500/20">
                  <AlertTriangle className="h-4 w-4 text-warning-400 shrink-0" />
                  <p className="text-xs text-warning-300"><strong>Mock evaluation</strong> — backend unavailable. Technical score is a heuristic estimate.</p>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <TrendingUp className="inline h-4 w-4 text-violet-400 mr-2" />
                    Technical Evaluation
                  </CardTitle>
                  <ScoreRing score={techEval.overallScore} size="sm" showLabel={false} />
                </CardHeader>
                {techEval.strengths.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-success-400 mb-2 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" />Strengths</p>
                    <ul className="space-y-1">{techEval.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-success-400 shrink-0">·</span>{s}</li>)}</ul>
                  </div>
                )}
                {techEval.improvements.length > 0 && (
                  <div>
                    <p className="text-xs text-warning-400 mb-2 flex items-center gap-1.5"><Zap className="h-3 w-3" />Improvements</p>
                    <ul className="space-y-1">{techEval.improvements.map((s, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-warning-400 shrink-0">·</span>{s}</li>)}</ul>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, rating, color }: {
  icon: React.ReactNode; label: string; value: string; rating: { label: string; color: string }; color: string
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-2">
        <span className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-lg font-bold text-white num">{value}</p>
      <p className={`text-2xs mt-0.5 ${rating.color}`}>{rating.label}</p>
    </div>
  )
}

function StructureMarker({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 p-2 rounded-lg border text-xs', active ? 'border-success-500/20 bg-success-500/5 text-success-400' : 'border-white/[0.05] bg-white/[0.02] text-slate-600')}>
      <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-success-500' : 'bg-slate-700')} />
      {label}
    </div>
  )
}
