/**
 * Skill DNA — Interactive Knowledge Graph
 * Derived entirely from stored evaluation data — no hardcoded status values.
 */

import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge,
  BackgroundVariant, useNodesState, useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GitBranch, ChevronRight, Info } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { buildConceptEvidence } from '@/lib/utils'
import type { EvidenceStatus, TopicKey } from '@/types'

const SKILL_TREE: Record<TopicKey, Array<{ id: string; label: string; parent?: string; concepts: string[] }>> = {
  java: [
    { id: 'java-root', label: 'Java', concepts: ['java', 'JVM'] },
    { id: 'java-oop', label: 'OOP', parent: 'java-root', concepts: ['OOP abstraction', 'encapsulation', 'inheritance', 'polymorphism'] },
    { id: 'java-inh', label: 'Inheritance', parent: 'java-oop', concepts: ['inheritance'] },
    { id: 'java-poly', label: 'Polymorphism', parent: 'java-oop', concepts: ['polymorphism'] },
    { id: 'java-enc', label: 'Encapsulation', parent: 'java-oop', concepts: ['encapsulation'] },
    { id: 'java-coll', label: 'Collections', parent: 'java-root', concepts: ['ArrayList', 'LinkedList', 'HashMap', 'HashSet'] },
    { id: 'java-conc', label: 'Concurrency', parent: 'java-root', concepts: ['threads', 'synchronization', 'volatile', 'Executor'] },
    { id: 'java-mem', label: 'Memory/JVM', parent: 'java-root', concepts: ['heap memory', 'stack memory', 'garbage collection', 'JVM'] },
    { id: 'java-str', label: 'Streams', parent: 'java-root', concepts: ['lambda expressions', 'streams API', 'functional interfaces'] },
  ],
  dsa: [
    { id: 'dsa-root', label: 'DSA', concepts: ['Big-O notation', 'time complexity'] },
    { id: 'dsa-sort', label: 'Sorting', parent: 'dsa-root', concepts: ['merge sort', 'quicksort'] },
    { id: 'dsa-search', label: 'Searching', parent: 'dsa-root', concepts: ['binary search', 'O(log n)'] },
    { id: 'dsa-tree', label: 'Trees', parent: 'dsa-root', concepts: ['binary search tree', 'BST properties', 'balanced tree'] },
    { id: 'dsa-graph', label: 'Graphs', parent: 'dsa-root', concepts: ['BFS', 'DFS', 'graph traversal'] },
    { id: 'dsa-dp', label: 'Dynamic Prog', parent: 'dsa-root', concepts: ['dynamic programming', 'memoization', 'tabulation'] },
    { id: 'dsa-hash', label: 'Hash Tables', parent: 'dsa-root', concepts: ['hash table', 'hash function', 'collision resolution'] },
    { id: 'dsa-linear', label: 'Linear Structures', parent: 'dsa-root', concepts: ['stack', 'queue', 'LIFO', 'FIFO'] },
  ],
  dbms: [
    { id: 'db-root', label: 'DBMS', concepts: ['SQL databases'] },
    { id: 'db-sql', label: 'SQL', parent: 'db-root', concepts: ['INNER JOIN', 'LEFT JOIN', 'SQL queries'] },
    { id: 'db-norm', label: 'Normalization', parent: 'db-root', concepts: ['normalization', '1NF', '2NF', '3NF'] },
    { id: 'db-idx', label: 'Indexes', parent: 'db-root', concepts: ['database index', 'B-tree index', 'query optimization'] },
    { id: 'db-txn', label: 'Transactions', parent: 'db-root', concepts: ['atomicity', 'consistency', 'isolation', 'durability'] },
    { id: 'db-nosql', label: 'NoSQL', parent: 'db-root', concepts: ['NoSQL databases', 'CAP theorem'] },
  ],
  os: [
    { id: 'os-root', label: 'OS', concepts: ['operating system'] },
    { id: 'os-proc', label: 'Processes', parent: 'os-root', concepts: ['process', 'thread', 'context switching'] },
    { id: 'os-sched', label: 'Scheduling', parent: 'os-root', concepts: ['FCFS', 'SJF', 'Round Robin', 'Priority Scheduling'] },
    { id: 'os-mem', label: 'Memory', parent: 'os-root', concepts: ['virtual memory', 'paging', 'page fault', 'thrashing', 'TLB'] },
    { id: 'os-sync', label: 'Sync', parent: 'os-root', concepts: ['semaphore', 'mutex', 'critical section'] },
    { id: 'os-dead', label: 'Deadlock', parent: 'os-root', concepts: ['deadlock', 'mutual exclusion', 'circular wait'] },
  ],
  networks: [
    { id: 'net-root', label: 'Networks', concepts: ['OSI model'] },
    { id: 'net-osi', label: 'OSI Layers', parent: 'net-root', concepts: ['physical layer', 'network layer', 'application layer'] },
    { id: 'net-trans', label: 'Transport', parent: 'net-root', concepts: ['TCP', 'UDP', 'reliable transmission'] },
    { id: 'net-http', label: 'HTTP/HTTPS', parent: 'net-root', concepts: ['DNS resolution', 'TCP handshake', 'HTTP request', 'TLS', 'SSL'] },
    { id: 'net-api', label: 'API Design', parent: 'net-root', concepts: ['REST principles', 'HTTP methods', 'GraphQL'] },
  ],
  behavioral: [
    { id: 'beh-root', label: 'Behavioral', concepts: ['self-introduction', 'career goals'] },
    { id: 'beh-star', label: 'STAR Method', parent: 'beh-root', concepts: ['STAR method', 'problem-solving'] },
    { id: 'beh-comm', label: 'Communication', parent: 'beh-root', concepts: ['conflict resolution', 'communication', 'empathy'] },
    { id: 'beh-growth', label: 'Growth', parent: 'beh-root', concepts: ['learning agility', 'adaptability', 'growth mindset', 'resilience'] },
    { id: 'beh-plan', label: 'Planning', parent: 'beh-root', concepts: ['career planning', 'goal setting', 'prioritization'] },
  ],
}

const STATUS_COLORS: Record<EvidenceStatus | 'unknown', { bg: string; border: string; text: string; glow: string }> = {
  demonstrated:  { bg: '#10b981', border: '#059669', text: '#ffffff', glow: 'rgba(16,185,129,0.4)' },
  developing:    { bg: '#f59e0b', border: '#d97706', text: '#000000', glow: 'rgba(245,158,11,0.4)' },
  needs_practice:{ bg: '#ef4444', border: '#dc2626', text: '#ffffff', glow: 'rgba(239,68,68,0.4)' },
  unknown:       { bg: '#1e2d55', border: '#3d4f7c', text: '#94a3b8', glow: 'rgba(99,102,241,0.2)' },
}

function computeLayout(nodes: Array<{ id: string; parent?: string }>): Record<string, { x: number; y: number }> {
  const layout: Record<string, { x: number; y: number }> = {}
  const roots = nodes.filter(n => !n.parent)
  const childrenOf: Record<string, string[]> = {}
  for (const n of nodes) {
    if (n.parent) {
      childrenOf[n.parent] = childrenOf[n.parent] ?? []
      childrenOf[n.parent].push(n.id)
    }
  }
  let currentX = 0
  function place(id: string, depth: number) {
    const children = childrenOf[id] ?? []
    if (children.length === 0) {
      layout[id] = { x: currentX * 180, y: depth * 110 }
      currentX++
    } else {
      const startX = currentX
      for (const child of children) place(child, depth + 1)
      const endX = currentX - 1
      layout[id] = { x: ((startX + endX) / 2) * 180, y: depth * 110 }
    }
  }
  for (const root of roots) place(root.id, 0)
  return layout
}

export function SkillDNAPage() {
  const navigate = useNavigate()
  const { sessions, loadSessions, loadProfile } = useAppStore()

  useEffect(() => { loadProfile(); loadSessions() }, []) // eslint-disable-line

  const completedSessions = useMemo(() => sessions.filter(s => s.status === 'completed'), [sessions])
  const evidence = useMemo(() => buildConceptEvidence(completedSessions), [completedSessions])

  const conceptStatus = useMemo(() => {
    const map = new Map<string, EvidenceStatus>()
    for (const e of evidence) map.set(e.concept.toLowerCase(), e.status)
    return map
  }, [evidence])

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    const topicOffset: Record<TopicKey, number> = { java: 0, dsa: 1, dbms: 2, os: 3, networks: 4, behavioral: 5 }

    for (const [topic, skillNodes] of Object.entries(SKILL_TREE) as [TopicKey, typeof SKILL_TREE[TopicKey]][]) {
      const layout = computeLayout(skillNodes)
      const offsetX = topicOffset[topic] * 1400

      for (const skill of skillNodes) {
        const matchedStatuses = skill.concepts
          .map(c => conceptStatus.get(c.toLowerCase()))
          .filter((s): s is EvidenceStatus => s !== undefined)

        const status: EvidenceStatus | 'unknown' = matchedStatuses.length === 0 ? 'unknown'
          : matchedStatuses.includes('demonstrated') ? 'demonstrated'
          : matchedStatuses.includes('developing') ? 'developing'
          : 'needs_practice'

        const col = STATUS_COLORS[status]
        const pos = layout[skill.id] ?? { x: 0, y: 0 }

        nodes.push({
          id: skill.id,
          position: { x: offsetX + pos.x, y: pos.y + 60 },
          data: { label: skill.label, status, topic, concepts: skill.concepts, matchedCount: matchedStatuses.length },
          style: {
            background: col.bg, border: `2px solid ${col.border}`, color: col.text,
            borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: '600',
            boxShadow: `0 0 16px ${col.glow}`, cursor: 'default', minWidth: '120px',
            textAlign: 'center' as const,
          },
        })

        if (skill.parent) {
          edges.push({
            id: `${skill.parent}-${skill.id}`,
            source: skill.parent, target: skill.id,
            style: { stroke: `${col.border}70`, strokeWidth: 1.5 },
            animated: status === 'developing',
          })
        }
      }
    }
    return { initialNodes: nodes, initialEdges: edges }
  }, [conceptStatus])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  if (completedSessions.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<GitBranch className="h-8 w-8" />}
          title="No data for Skill DNA yet"
          description="Complete interview sessions to build your Skill DNA graph."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-5 w-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white">Skill DNA</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            Your knowledge graph — built from real evaluation evidence. Each node's color reflects your demonstrated understanding.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/interview/setup')} rightIcon={<ChevronRight />}>
          Add Evidence
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-5 text-xs text-slate-400">
        {(['demonstrated', 'developing', 'needs_practice', 'unknown'] as const).map(s => {
          const col = STATUS_COLORS[s]
          const labels: Record<string, string> = {
            demonstrated: 'Demonstrated (avg ≥75%, ≥2 sessions)',
            developing: 'Developing (avg ≥50%)',
            needs_practice: 'Needs Practice',
            unknown: 'Not practiced yet',
          }
          return (
            <span key={s} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: col.bg }} />
              {labels[s]}
            </span>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Demonstrated', count: evidence.filter(e => e.status === 'demonstrated').length, color: 'text-success-400' },
          { label: 'Developing', count: evidence.filter(e => e.status === 'developing').length, color: 'text-warning-400' },
          { label: 'Needs Work', count: evidence.filter(e => e.status === 'needs_practice').length, color: 'text-danger-400' },
        ].map(s => (
          <Card key={s.label} padding="sm" className="text-center">
            <p className={`text-2xl font-bold ${s.color} num`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden" style={{ height: '560px' }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          fitView fitViewOptions={{ padding: 0.15 }}
          attributionPosition="bottom-right"
          style={{ background: 'transparent' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.04)" />
          <Controls style={{ background: 'rgba(10,16,32,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
          <MiniMap
            style={{ background: 'rgba(10,16,32,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
            nodeColor={n => STATUS_COLORS[(n.data as { status?: EvidenceStatus | 'unknown' }).status ?? 'unknown']?.bg ?? '#1e2d55'}
          />
        </ReactFlow>
      </Card>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>
          Node color is derived from your evaluation data. Concepts you've explained correctly are green, partially covered are amber, missing from answers are red. Gray nodes haven't appeared in any evaluated session yet. Scroll and zoom to explore.
        </p>
      </div>
    </div>
  )
}
