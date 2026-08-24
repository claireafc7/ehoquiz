"use client"

import { useSyncExternalStore } from "react"
import { TOTAL_QUESTIONS as TOTAL, type AppData, type Person, type Question, type Response } from "./types"
import {
  addPerson as srvAddPerson,
  getData as srvGetData,
  recordResponse as srvRecordResponse,
  removePerson as srvRemovePerson,
  resetPerson as srvResetPerson,
  undoResponse as srvUndoResponse,
  updateQuestion as srvUpdateQuestion,
} from "@/app/actions/data"

/**
 * Client store backed by a Neon Postgres database (via server actions).
 * The public API (useAppData + actions) is unchanged, so components stay the
 * same. Mutations update an in-memory cache optimistically for a snappy UI,
 * then persist to the database and reconcile with authoritative data.
 */

export const TOTAL_QUESTIONS = TOTAL

const EMPTY: AppData = { people: [], questions: [], responses: [] }

let cache: AppData | null = null
let loaded = false
let loading = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function setCache(next: AppData) {
  cache = next
  emit()
}

async function load() {
  if (loading) return
  loading = true
  try {
    cache = await srvGetData()
    loaded = true
  } catch {
    // stay on empty snapshot; a later action or refocus can retry
  } finally {
    loading = false
    emit()
  }
}

async function reload() {
  try {
    cache = await srvGetData()
    loaded = true
    emit()
  } catch {
    // ignore; keep optimistic state
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!loaded && !loading) void load()
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): AppData {
  return cache ?? EMPTY
}

function getServerSnapshot(): AppData {
  return EMPTY
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// ---- Public hook + actions ----

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Debounced persistence for question edits (fired per keystroke).
const questionTimers = new Map<string, ReturnType<typeof setTimeout>>()
function persistQuestionDebounced(questionId: string) {
  const existing = questionTimers.get(questionId)
  if (existing) clearTimeout(existing)
  questionTimers.set(
    questionId,
    setTimeout(() => {
      questionTimers.delete(questionId)
      const q = (cache ?? EMPTY).questions.find((q) => q.id === questionId)
      if (q) void srvUpdateQuestion(questionId, { text: q.text, answer: q.answer })
    }, 600),
  )
}

export const actions = {
  addPerson(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const data = getSnapshot()
    const person: Person = { id: `tmp-${uid()}`, name: trimmed, createdAt: Date.now() }
    setCache({ ...data, people: [...data.people, person] })
    void srvAddPerson(trimmed).then(reload, reload)
  },

  removePerson(personId: string) {
    const data = getSnapshot()
    setCache({
      ...data,
      people: data.people.filter((p) => p.id !== personId),
      responses: data.responses.filter((r) => r.personId !== personId),
    })
    void srvRemovePerson(personId).then(reload, reload)
  },

  updateQuestion(questionId: string, patch: Partial<Pick<Question, "text" | "answer">>) {
    const data = getSnapshot()
    setCache({
      ...data,
      questions: data.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
    })
    // Persist (debounced) without reloading, so the input isn't reset mid-typing.
    persistQuestionDebounced(questionId)
  },

  recordResponse(personId: string, questionId: string, correct: boolean) {
    const data = getSnapshot()
    const already = data.responses.some(
      (r) => r.personId === personId && r.questionId === questionId,
    )
    if (already) return
    const response: Response = {
      id: `tmp-${uid()}`,
      personId,
      questionId,
      correct,
      askedAt: Date.now(),
    }
    setCache({ ...data, responses: [...data.responses, response] })
    void srvRecordResponse(personId, questionId, correct).then(reload, reload)
  },

  undoResponse(responseId: string) {
    const data = getSnapshot()
    setCache({ ...data, responses: data.responses.filter((r) => r.id !== responseId) })
    void srvUndoResponse(responseId).then(reload, reload)
  },

  resetPerson(personId: string) {
    const data = getSnapshot()
    setCache({ ...data, responses: data.responses.filter((r) => r.personId !== personId) })
    void srvResetPerson(personId).then(reload, reload)
  },
}

// ---- Selectors / helpers ----

export function unansweredQuestions(data: AppData, personId: string): Question[] {
  const answered = new Set(
    data.responses.filter((r) => r.personId === personId).map((r) => r.questionId),
  )
  return data.questions.filter((q) => !answered.has(q.id))
}

export function personResponses(data: AppData, personId: string): Response[] {
  return data.responses
    .filter((r) => r.personId === personId)
    .sort((a, b) => a.askedAt - b.askedAt)
}

export function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}
