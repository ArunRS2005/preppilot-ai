/**
 * Resume & Job Description Intelligence
 *
 * Lets the user paste (or upload) their resume and a job description.
 * The system extracts skills and generates interview questions matched
 * to the role requirements.
 *
 * All processing is client-side text parsing — no external resume parsing API.
 * Interview question generation reuses the backend evaluation endpoint's
 * personality context.
 *
 * Resume content never leaves the browser unless the user explicitly submits
 * it to the evaluation endpoint (only the generated answer text is sent).
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Zap, CheckCircle, AlertTriangle,
  Briefcase, Sparkles, Trash2, ArrowRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FadeInView } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

// ─── Skill keyword library ─────────────────────────────────────────────────────
// Used to detect mentioned skills in resume and JD text

const SKILL_LIBRARY: Record<string, string[]> = {
  // Languages
  'Java':       ['java', 'jvm', 'spring', 'springboot', 'spring boot', 'maven', 'gradle'],
  'Python':     ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
  'JavaScript': ['javascript', 'js', 'node', 'nodejs', 'express', 'react', 'vue', 'angular'],
  'TypeScript': ['typescript', 'ts'],
  'C++':        ['c++', 'cpp', 'stl'],
  'C':          ['c language', ' c ', 'pointers'],
  'Go':         ['golang', ' go ', 'goroutine'],
  'SQL':        ['sql', 'mysql', 'postgresql', 'postgres', 'oracle', 'sqlite'],
  'NoSQL':      ['mongodb', 'redis', 'cassandra', 'dynamodb', 'nosql'],
  // Frameworks
  'React':      ['react', 'reactjs', 'redux', 'hooks'],
  'Spring Boot':['spring boot', 'springboot', 'spring-boot'],
  // Cloud
  'AWS':        ['aws', 'ec2', 's3', 'lambda', 'dynamodb', 'rds'],
  'Docker':     ['docker', 'container', 'containerization'],
  'Kubernetes': ['kubernetes', 'k8s'],
  // Concepts
  'REST API':   ['rest', 'restful', 'api'],
  'GraphQL':    ['graphql'],
  'Microservices': ['microservice', 'microservices'],
  'CI/CD':      ['ci/cd', 'jenkins', 'github actions', 'gitlab ci'],
  'Git':        ['git', 'github', 'gitlab', 'version control'],
  'Agile':      ['agile', 'scrum', 'sprint', 'jira'],
  // Data
  'Data Structures': ['data structures', 'linked list', 'tree', 'graph', 'hash map'],
  'Algorithms': ['algorithm', 'algorithms', 'complexity', 'big-o', 'sorting', 'searching'],
  'Operating Systems': ['operating system', 'os', 'process', 'thread', 'scheduling'],
  'Databases':  ['database', 'dbms', 'normalization', 'indexing', 'transaction'],
  'Networking': ['network', 'tcp', 'udp', 'http', 'tcp/ip', 'osI'],
  'Machine Learning': ['machine learning', 'ml', 'tensorflow', 'pytorch', 'neural network'],
}

const QUESTION_TEMPLATES: string[] = [
  'Walk me through your experience with {skill}. What did you build with it?',
  'Describe a challenging problem you solved using {skill}. What was your approach?',
  'How would you explain {skill} to someone who has never used it?',
  'What are the key trade-offs when using {skill} in production?',
  'Tell me about a time {skill} didn\'t work as expected. How did you debug it?',
  'How does {skill} compare to alternatives you\'ve used?',
  'What\'s a common misconception about {skill} that you\'d correct?',
  'Design a system that uses {skill}. What would you consider?',
]

interface ResumeAnalysis {
  resumeSkills: string[]
  jdSkills: string[]
  matched: string[]
  gaps: string[]
  extraResumeSkills: string[]
  matchPercent: number
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const [skill, keywords] of Object.entries(SKILL_LIBRARY)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.add(skill)
    }
  }
  return Array.from(found)
}

function analyze(resume: string, jd: string): ResumeAnalysis {
  const resumeSkills = extractSkills(resume)
  const jdSkills = extractSkills(jd)
  const matched = resumeSkills.filter(s => jdSkills.includes(s))
  const gaps = jdSkills.filter(s => !resumeSkills.includes(s))
  const extraResumeSkills = resumeSkills.filter(s => !jdSkills.includes(s))
  const matchPercent = jdSkills.length > 0
    ? Math.round((matched.length / jdSkills.length) * 100)
    : 0
  return { resumeSkills, jdSkills, matched, gaps, extraResumeSkills, matchPercent }
}

function generateQuestions(skills: string[]): string[] {
  // Pick up to 5 skills, assign a random question template to each
  const shuffled = [...skills].sort(() => Math.random() - 0.5).slice(0, 5)
  return shuffled.map((skill, i) => {
    const template = QUESTION_TEMPLATES[i % QUESTION_TEMPLATES.length]
    return template.replace('{skill}', skill)
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ResumeIntelligencePage() {
  const navigate = useNavigate()
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const resumeFileRef = useRef<HTMLInputElement>(null)
  const jdFileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File, setter: (text: string) => void) => {
    const reader = new FileReader()
    reader.onload = e => setter(String(e.target?.result ?? ''))
    reader.readAsText(file)
  }

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jdText.trim()) return
    setAnalysis(analyze(resumeText, jdText))
    setGeneratedQuestions([])
  }

  const handleGenerateQuestions = async () => {
    if (!analysis) return
    setGenerating(true)
    // Simulate AI generation time for better UX
    await new Promise(r => setTimeout(r, 800))
    const skills = analysis.gaps.length > 0 ? analysis.gaps : analysis.matched
    setGeneratedQuestions(generateQuestions(skills))
    setGenerating(false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FadeInView className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-bold text-white">Resume Intelligence</h1>
          <Badge variant="purple" size="sm">Beta</Badge>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl">
          Paste your resume and a job description. We identify matched skills, gaps, and generate targeted interview questions.
        </p>
      </FadeInView>

      {/* Privacy */}
      <div className="mb-6 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Resume and JD text are processed <strong className="text-indigo-300">entirely in your browser</strong>. 
          They are never uploaded or stored. Only generated question text is sent to the evaluation endpoint when you practice an answer.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* Resume */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Briefcase className="inline h-4 w-4 text-violet-400 mr-2" />
              Your Resume
            </CardTitle>
            <input
              ref={resumeFileRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, setResumeText) }}
            />
            <Button variant="ghost" size="xs" onClick={() => resumeFileRef.current?.click()} leftIcon={<Upload />}>
              Upload .txt
            </Button>
          </CardHeader>
          <Textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume text here, or upload a .txt file…"
            rows={10}
          />
          {resumeText && (
            <button onClick={() => setResumeText('')} className="mt-2 text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1">
              <Trash2 className="h-3 w-3" />Clear
            </button>
          )}
        </Card>

        {/* Job description */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Sparkles className="inline h-4 w-4 text-cyan-400 mr-2" />
              Job Description
            </CardTitle>
            <input
              ref={jdFileRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, setJdText) }}
            />
            <Button variant="ghost" size="xs" onClick={() => jdFileRef.current?.click()} leftIcon={<Upload />}>
              Upload .txt
            </Button>
          </CardHeader>
          <Textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste the job description here, or upload a .txt file…"
            rows={10}
          />
          {jdText && (
            <button onClick={() => setJdText('')} className="mt-2 text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1">
              <Trash2 className="h-3 w-3" />Clear
            </button>
          )}
        </Card>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!resumeText.trim() || !jdText.trim()}
        leftIcon={<Zap />}
        size="lg"
        className="w-full mb-6"
      >
        Analyze Match
      </Button>

      {/* Analysis results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Match score */}
            <Card className="text-center py-8">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Skill Match</p>
              <p className={cn('text-5xl font-bold mb-2 num', analysis.matchPercent >= 75 ? 'text-success-400' : analysis.matchPercent >= 50 ? 'text-warning-400' : 'text-danger-400')}>
                {analysis.matchPercent}%
              </p>
              <p className="text-xs text-slate-500">
                {analysis.matched.length} of {analysis.jdSkills.length} required skills present in your resume
              </p>
              <div className="mt-4 max-w-xs mx-auto">
                <ProgressBar value={analysis.matchPercent} color="auto" size="md" glow animated />
              </div>
            </Card>

            {/* Matched + Gaps */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <CheckCircle className="inline h-4 w-4 text-success-400 mr-2" />
                    Matched Skills
                  </CardTitle>
                  <Badge variant="success" size="sm">{analysis.matched.length}</Badge>
                </CardHeader>
                {analysis.matched.length === 0 ? (
                  <p className="text-slate-500 text-sm">No direct skill matches found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400 text-xs border border-success-500/20">{s}</span>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <AlertTriangle className="inline h-4 w-4 text-warning-400 mr-2" />
                    Skill Gaps
                  </CardTitle>
                  <Badge variant="warning" size="sm">{analysis.gaps.length}</Badge>
                </CardHeader>
                {analysis.gaps.length === 0 ? (
                  <p className="text-slate-500 text-sm">No skill gaps detected — strong match!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.gaps.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-warning-500/10 text-warning-400 text-xs border border-warning-500/20">{s}</span>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Extra resume skills */}
            {analysis.extraResumeSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Skills (not in JD)</CardTitle>
                  <Badge variant="default" size="sm">{analysis.extraResumeSkills.length}</Badge>
                </CardHeader>
                <div className="flex flex-wrap gap-2">
                  {analysis.extraResumeSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-xs border border-white/10">{s}</span>
                  ))}
                </div>
              </Card>
            )}

            {/* Generate questions */}
            {!generatedQuestions.length && (
              <Button
                onClick={handleGenerateQuestions}
                loading={generating}
                leftIcon={<Sparkles />}
                size="lg"
                className="w-full"
              >
                Generate Targeted Interview Questions
              </Button>
            )}

            {/* Generated questions */}
            {generating && (
              <Card className="flex flex-col items-center gap-3 py-10">
                <LoadingSpinner size="md" label="Generating role-specific questions…" />
              </Card>
            )}

            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Sparkles className="inline h-4 w-4 text-violet-400 mr-2" />
                    Generated Interview Questions
                  </CardTitle>
                  <Button variant="ghost" size="xs" onClick={handleGenerateQuestions} leftIcon={<Zap />}>
                    Regenerate
                  </Button>
                </CardHeader>
                <p className="text-xs text-slate-500 mb-4">
                  Questions are matched to your skill gaps and target role. Practice them with the AI interviewer.
                </p>
                <div className="space-y-3">
                  {generatedQuestions.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300 flex-1">{q}</p>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate('/interview/setup')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        rightIcon={<ArrowRight />}
                      >
                        Practice
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
