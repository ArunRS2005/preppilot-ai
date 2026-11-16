import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InterviewSetupPage } from '@/pages/InterviewSetupPage'
import { MockInterviewPage } from '@/pages/MockInterviewPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { PracticePage } from '@/pages/PracticePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SkillDNAPage } from '@/pages/SkillDNAPage'
import { RoadmapPage } from '@/pages/RoadmapPage'
import { AnswerEvolutionPage } from '@/pages/AnswerEvolutionPage'
import { PassportPage } from '@/pages/PassportPage'
import { EngineeringLabPage } from '@/pages/EngineeringLabPage'
import { VoicePracticePage } from '@/pages/VoicePracticePage'
import { ResumeIntelligencePage } from '@/pages/ResumeIntelligencePage'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-gradient mb-4">404</p>
      <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
      <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
        Go home
      </a>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — no shared nav */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-navy-950 text-white">
              <LandingPage />
            </div>
          }
        />

        {/* App routes with shared nav */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard"          element={<DashboardPage />} />
          <Route path="/interview/setup"    element={<InterviewSetupPage />} />
          <Route path="/interview/:sessionId" element={<MockInterviewPage />} />
          <Route path="/history"            element={<HistoryPage />} />
          <Route path="/history/:id"        element={<SessionDetailPage />} />
          <Route path="/practice"           element={<PracticePage />} />
          <Route path="/settings"           element={<SettingsPage />} />
          {/* New Phase 2 routes */}
          <Route path="/skill-dna"          element={<SkillDNAPage />} />
          <Route path="/roadmap"            element={<RoadmapPage />} />
          <Route path="/evolution"          element={<AnswerEvolutionPage />} />
          <Route path="/passport"           element={<PassportPage />} />
          <Route path="/lab"                element={<EngineeringLabPage />} />
          <Route path="/voice"               element={<VoicePracticePage />} />
          <Route path="/resume"              element={<ResumeIntelligencePage />} />
          <Route path="*"                   element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
