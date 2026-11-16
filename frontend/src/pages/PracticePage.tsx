import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ChevronRight, Target, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAppStore } from '@/store/useAppStore'
import { TOPIC_LABELS, TOPIC_COLORS } from '@/lib/utils'

const ALL_TOPICS = [
  { key: 'java' as const, description: 'OOP, JVM, Collections, Concurrency, Streams', count: 8 },
  { key: 'dsa' as const, description: 'Sorting, Searching, Trees, Graphs, Dynamic Programming', count: 8 },
  { key: 'dbms' as const, description: 'SQL, Normalization, Indexes, Transactions, NoSQL', count: 6 },
  { key: 'os' as const, description: 'Processes, Scheduling, Deadlock, Memory, Sync', count: 6 },
  { key: 'networks' as const, description: 'OSI, TCP/UDP, HTTP, TLS, REST APIs', count: 6 },
  { key: 'behavioral' as const, description: 'STAR method, Goals, Conflict, Adaptability', count: 8 },
]

export function PracticePage() {
  const navigate = useNavigate()
  const { dashboardData, loadProfile, loadSessions } = useAppStore()

  useEffect(() => {
    loadProfile()
    loadSessions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Practice Topics</h1>
        <p className="text-slate-400">Choose a topic to start a targeted practice session.</p>
      </div>

      {/* Recommendations */}
      {dashboardData?.recommendations && dashboardData.recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-violet-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-white">Recommended for You</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {dashboardData.recommendations.slice(0, 4).map(rec => (
              <Card key={rec.id} hover className="cursor-pointer group" onClick={() => navigate(`/interview/setup?topic=${rec.topic}`)}>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{rec.topicLabel}</span>
                      <Badge variant="purple" size="sm">Recommended</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{rec.reason}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      ~{rec.estimatedMinutes} min
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" aria-hidden="true" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All topics */}
      <h2 className="text-sm font-semibold text-white mb-4">All Topics</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_TOPICS.map(topic => {
          const perf = dashboardData?.topicPerformance.find(t => t.topic === topic.key)
          const color = TOPIC_COLORS[topic.key]
          return (
            <Card key={topic.key} hover className="cursor-pointer group" onClick={() => navigate(`/interview/setup?topic=${topic.key}`)}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-white">{TOPIC_LABELS[topic.key]}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{topic.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{topic.count} questions</span>
                {perf && <span>{perf.averageScore}% avg</span>}
              </div>
              {perf && (
                <ProgressBar value={perf.averageScore} size="sm" color="auto" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 group-hover:text-violet-300"
                rightIcon={<ChevronRight />}
                onClick={e => { e.stopPropagation(); navigate(`/interview/setup?topic=${topic.key}`) }}
              >
                Practice
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
