import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, ChevronRight, BookOpen, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAppStore } from '@/store/useAppStore'
import {
  TOPIC_LABELS, DIFFICULTY_COLORS, formatDate, formatRelative,
} from '@/lib/utils'
import type { InterviewSession } from '@/types'

export function HistoryPage() {
  const navigate = useNavigate()
  const { sessions, loadSessions } = useAppStore()
  const [search, setSearch] = useState('')

  useEffect(() => { loadSessions() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const completed = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime())

  const filtered = completed.filter(s =>
    !search ||
    TOPIC_LABELS[s.topic].toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  )

  if (completed.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title="No sessions yet"
          description="Complete your first interview to see your history here."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Interview History</h1>
          <p className="text-slate-400 text-sm mt-0.5">{completed.length} session{completed.length !== 1 ? 's' : ''} completed</p>
        </div>
        <Button onClick={() => navigate('/interview/setup')} size="sm">New Interview</Button>
      </div>

      <Input
        placeholder="Search by topic or role…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search />}
        className="mb-5"
        aria-label="Search sessions"
      />

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No sessions match your search.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <SessionCard key={s.id} session={s} onClick={() => navigate(`/history/${s.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session, onClick }: { session: InterviewSession; onClick: () => void }) {
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0">
          <BookOpen className="h-5 w-5 text-violet-400" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{TOPIC_LABELS[session.topic]}</span>
            <Badge variant="default" size="sm" className={DIFFICULTY_COLORS[session.difficulty]}>
              {session.difficulty}
            </Badge>
            <Badge variant="default" size="sm">{session.interviewType}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {session.role} · {session.questionCount} questions ·{' '}
            {session.completedAt ? formatRelative(session.completedAt) : 'In progress'}
          </p>
        </div>
        {session.overallScore !== null && (
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-white">{session.overallScore}%</p>
            <p className="text-xs text-slate-500">{formatDate(session.completedAt ?? session.createdAt)}</p>
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
      </div>
    </Card>
  )
}
