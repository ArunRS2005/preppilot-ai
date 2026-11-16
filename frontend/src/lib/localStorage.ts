/**
 * Local development persistence layer.
 * Used when Supabase credentials are not configured.
 * Stores data in localStorage under 'preppilot_store'.
 * NOT for production use — has no auth or server sync.
 */

import type { InterviewSession, LocalStore, UserProfile } from '@/types'
import { generateId } from './utils'

const STORE_KEY = 'preppilot_store'
const STORE_VERSION = 1

function defaultProfile(): UserProfile {
  return {
    id: generateId(),
    name: 'Practitioner',
    email: '',
    targetRole: 'Software Engineer',
    experienceLevel: 'entry',
    preferredTopics: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function loadStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { profile: null, sessions: [], version: STORE_VERSION }
    const parsed = JSON.parse(raw) as Partial<LocalStore>
    if (parsed.version !== STORE_VERSION) {
      // Migration: wipe old format
      return { profile: null, sessions: [], version: STORE_VERSION }
    }
    return {
      profile: parsed.profile ?? null,
      sessions: (parsed.sessions ?? []).map((s: Partial<import('@/types').InterviewSession>) => ({
        ...s,
        personality: s.personality ?? 'friendly_mentor',
      })) as import('@/types').InterviewSession[],
      version: STORE_VERSION,
    }
  } catch {
    return { profile: null, sessions: [], version: STORE_VERSION }
  }
}

function saveStore(store: LocalStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function getLocalProfile(): UserProfile {
  const store = loadStore()
  if (!store.profile) {
    const profile = defaultProfile()
    saveStore({ ...store, profile })
    return profile
  }
  return store.profile
}

export function updateLocalProfile(updates: Partial<UserProfile>): UserProfile {
  const store = loadStore()
  const current = store.profile ?? defaultProfile()
  const updated: UserProfile = {
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }
  saveStore({ ...store, profile: updated })
  return updated
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function getLocalSessions(): InterviewSession[] {
  return loadStore().sessions
}

export function getLocalSession(id: string): InterviewSession | null {
  return loadStore().sessions.find(s => s.id === id) ?? null
}

export function saveLocalSession(session: InterviewSession): void {
  const store = loadStore()
  const idx = store.sessions.findIndex(s => s.id === session.id)
  if (idx >= 0) {
    store.sessions[idx] = session
  } else {
    store.sessions.push(session)
  }
  saveStore(store)
}

export function deleteLocalSession(id: string): void {
  const store = loadStore()
  store.sessions = store.sessions.filter(s => s.id !== id)
  saveStore(store)
}

// ─── Clear all ────────────────────────────────────────────────────────────────

export function clearLocalStore(): void {
  localStorage.removeItem(STORE_KEY)
}
