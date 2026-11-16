import { useEffect, useState } from 'react'
import { User, Shield, Trash2, Save, Server } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useAppStore } from '@/store/useAppStore'
import { clearLocalStore } from '@/lib/localStorage'

const EXPERIENCE_OPTIONS = [
  { value: 'entry', label: 'Entry (0–1 year)' },
  { value: 'junior', label: 'Junior (1–3 years)' },
  { value: 'mid', label: 'Mid (3–5 years)' },
]

export function SettingsPage() {
  const { profile, updateProfile, loadProfile, sessions } = useAppStore()
  const [name, setName] = useState(profile?.name ?? '')
  const [role, setRole] = useState(profile?.targetRole ?? '')
  const [level, setLevel] = useState(profile?.experienceLevel ?? 'entry')
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setRole(profile.targetRole)
      setLevel(profile.experienceLevel)
    }
  }, [profile])

  function handleSave() {
    updateProfile({ name, targetRole: role, experienceLevel: level as 'entry' | 'junior' | 'mid' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClearData() {
    clearLocalStore()
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your profile and preferences.</p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>
              <User className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Profile
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
            />
            <Input
              label="Target Role"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
            />
            <Select
              label="Experience Level"
              value={level}
              onChange={e => setLevel(e.target.value as 'entry' | 'junior' | 'mid')}
              options={EXPERIENCE_OPTIONS}
            />
            <Button onClick={handleSave} leftIcon={<Save />}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Data & backend */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Server className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Data & Backend
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
              <span>Storage mode</span>
              <Badge variant="warning">Local (browser)</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
              <span>Sessions stored</span>
              <span className="text-white">{sessions.filter(s => s.status === 'completed').length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>AI evaluation</span>
              <Badge variant="default">Gemini (when available)</Badge>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            Data is stored locally in your browser. Set up the backend with a Gemini API key for
            full AI evaluation. See README for instructions.
          </p>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Shield className="inline h-4 w-4 mr-2 text-violet-400" aria-hidden="true" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm text-slate-400 mb-4">
            <p>All practice data is stored locally in your browser. No personal data is sent to external servers except your answer text, which is sent to the backend for AI evaluation when configured.</p>
            <p>Your API keys are never stored in the browser. They are only used server-side.</p>
          </div>

          {!confirmClear ? (
            <Button variant="danger" size="sm" leftIcon={<Trash2 />} onClick={() => setConfirmClear(true)}>
              Clear All Local Data
            </Button>
          ) : (
            <div className="space-y-3">
              <ErrorMessage
                type="warning"
                message="This will permanently delete all your sessions, scores, and evidence. This cannot be undone."
              />
              <div className="flex gap-3">
                <Button variant="danger" size="sm" onClick={handleClearData}>Confirm Delete</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
