/**
 * Interview Evidence Passport
 * Exportable professional summary of practice history and demonstrated skills.
 * Based entirely on actual session data. Never claims to certify readiness.
 */

import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fingerprint, Download, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { FadeInView, AnimatedCounter } from '@/components/ui/motion'
import {
  TOPIC_LABELS, TOPIC_COLORS, buildConceptEvidence,
  buildTopicPerformance, calcReadinessScore, formatDate,
} from '@/lib/utils'

export function PassportPage() {
  const navigate = useNavigate()
  const { sessions, loadSessions, loadProfile, profile } = useAppStore()

  useEffect(() => { loadProfile(); loadSessions() }, []) // eslint-disable-line

  const completed = useMemo(() => sessions.filter(s => s.status === 'completed'), [sessions])
  const evidence = useMemo(() => buildConceptEvidence(completed), [completed])
  const topicPerf = useMemo(() => buildTopicPerformance(completed), [completed])
  const { score: readiness, explanation } = useMemo(() => calcReadinessScore(topicPerf), [topicPerf])

  const demonstrated = evidence.filter(e => e.status === 'demonstrated')
  const developing    = evidence.filter(e => e.status === 'developing')
  const needsWork     = evidence.filter(e => e.status === 'needs_practice')

  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (completed.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<Fingerprint className="h-8 w-8" />}
          title="No data for your Passport yet"
          description="Complete interview sessions to generate your Interview Evidence Passport."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeInView>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="h-5 w-5 text-violet-400" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-white">Interview Evidence Passport</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              A summary of your practice sessions and demonstrated skills. This is evidence from practice — not a certification or hiring guarantee.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download />}
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
        </div>
      </FadeInView>

      {/* Passport card — this is what prints */}
      <div id="passport-content" className="space-y-5">

        {/* Identity section */}
        <Card className="relative overflow-hidden" glow="violet">
          <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Fingerprint className="h-4 w-4 text-violet-400" aria-hidden="true" />
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Interview Evidence Passport</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-0.5">{profile?.name ?? 'Practitioner'}</h2>
                <p className="text-slate-400 text-sm">Target Role: <span className="text-white font-medium">{profile?.targetRole ?? 'Software Engineer'}</span></p>
                <p className="text-slate-500 text-xs mt-1">Generated: {generatedDate}</p>
              </div>
              <ScoreRing score={readiness} size="lg" showGlow />
            </div>
            <div className="mt-4 p-3 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-warning-300 leading-relaxed">
                This passport reflects evidence from practice sessions only. It does not predict interview outcomes or certify any qualification. Readiness scores are estimates based on self-reported answers.
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Sessions Completed',       value: completed.length,     suffix: '' },
            { label: 'Concepts Demonstrated',    value: demonstrated.length,  suffix: '' },
            { label: 'Avg Session Score',         value: Math.round(topicPerf.reduce((s, t) => s + t.averageScore, 0) / Math.max(1, topicPerf.length)), suffix: '%' },
            { label: 'Topics Practiced',          value: topicPerf.length,     suffix: '/6' },
          ].map(s => (
            <Card key={s.label} padding="sm" className="text-center">
              <p className="text-2xl font-bold text-white num">
                <AnimatedCounter value={s.value} suffix={s.suffix} duration={800} />
              </p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Readiness explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Readiness Score Breakdown</CardTitle>
            <Badge variant="purple">{readiness}/100</Badge>
          </CardHeader>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">{explanation}</p>
          <ProgressBar value={readiness} color="violet" size="lg" glow animated />
        </Card>

        {/* Topic performance */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Performance</CardTitle>
          </CardHeader>
          {topicPerf.length === 0 ? (
            <p className="text-slate-500 text-sm">No topic data.</p>
          ) : (
            <div className="space-y-4">
              {topicPerf.map(t => {
                const color = TOPIC_COLORS[t.topic]
                return (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                        <span className="text-sm font-medium text-white">{t.topicLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white num">{t.averageScore}%</span>
                        <Badge variant={t.evidenceStatus === 'demonstrated' ? 'success' : t.evidenceStatus === 'developing' ? 'warning' : 'danger'} size="sm">
                          {t.sessionsCount} session{t.sessionsCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    <ProgressBar value={t.averageScore} color="auto" size="sm" animated />
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Demonstrated concepts */}
        {demonstrated.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <CheckCircle className="inline h-4 w-4 text-success-400 mr-2" aria-hidden="true" />
                Demonstrated Skills
              </CardTitle>
              <Badge variant="success">{demonstrated.length}</Badge>
            </CardHeader>
            <p className="text-xs text-slate-500 mb-3">These concepts appeared in evaluated answers with avg ≥75% across ≥2 sessions.</p>
            <div className="flex flex-wrap gap-2">
              {demonstrated.map(e => (
                <span key={e.concept} className="px-3 py-1.5 rounded-xl bg-success-500/10 text-success-400 text-xs font-medium border border-success-500/20 flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                  {e.concept}
                  <span className="opacity-50">·{e.averageScore}%</span>
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Areas in progress */}
        {(developing.length > 0 || needsWork.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp className="inline h-4 w-4 text-warning-400 mr-2" aria-hidden="true" />
                Skills in Development
              </CardTitle>
            </CardHeader>
            <p className="text-xs text-slate-500 mb-3">These concepts appeared in evaluations but have not yet reached the demonstrated threshold.</p>
            <div className="flex flex-wrap gap-2">
              {[...developing, ...needsWork].map(e => (
                <span key={e.concept} className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                  e.status === 'developing'
                    ? 'bg-warning-500/10 text-warning-400 border-warning-500/20'
                    : 'bg-danger-500/10 text-danger-400 border-danger-500/20'
                }`}>
                  {e.concept}
                  <span className="opacity-50">·{e.averageScore}%</span>
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Session history */}
        <Card>
          <CardHeader>
            <CardTitle>Practice Session History</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {completed
              .sort((a, b) => new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime())
              .map(session => (
                <div key={session.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{TOPIC_LABELS[session.topic]}</span>
                      <Badge variant="default" size="sm">{session.role}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {session.completedAt ? formatDate(session.completedAt) : '—'} · {session.questionCount} questions
                    </p>
                  </div>
                  {session.overallScore !== null && (
                    <span className="text-sm font-bold text-white num shrink-0">{session.overallScore}%</span>
                  )}
                </div>
              ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl border border-white/[0.05] bg-navy-900/40">
          <p className="text-xs text-slate-600 leading-relaxed text-center">
            This document was generated by PrepPilot AI on {generatedDate}. It represents evidence from self-directed practice sessions and AI-evaluated answers. It is not a formal qualification, employer-issued certification, or guarantee of interview success. Scores are based on AI evaluation of text answers and should be treated as practice feedback only.
          </p>
        </div>
      </div>
    </div>
  )
}
