"use server"

import { and, asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { people, questions, responses } from "@/lib/db/schema"
import { requireAccess } from "@/lib/access"
import { TOTAL_QUESTIONS, type AppData } from "@/lib/types"

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

/** Make sure exactly TOTAL_QUESTIONS seed questions exist on first run. */
async function ensureSeeded() {
  const existing = await db.select({ id: questions.id }).from(questions)
  if (existing.length >= TOTAL_QUESTIONS) return
  const seed = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
    id: `q${i + 1}`,
    text: `Sample question ${i + 1} — edit this in the Manage tab.`,
    answer: `Expected answer ${i + 1}`,
    position: i,
  }))
  const have = new Set(existing.map((q) => q.id))
  const missing = seed.filter((q) => !have.has(q.id))
  if (missing.length) await db.insert(questions).values(missing)
}

export async function getData(): Promise<AppData> {
  await requireAccess()
  await ensureSeeded()

  const [peopleRows, questionRows, responseRows] = await Promise.all([
    db.select().from(people).orderBy(asc(people.createdAt)),
    db.select().from(questions).orderBy(asc(questions.position)),
    db.select().from(responses).orderBy(asc(responses.askedAt)),
  ])

  return {
    people: peopleRows.map((p) => ({ id: p.id, name: p.name, createdAt: p.createdAt })),
    questions: questionRows.slice(0, TOTAL_QUESTIONS).map((q) => ({
      id: q.id,
      text: q.text,
      answer: q.answer,
    })),
    responses: responseRows.map((r) => ({
      id: r.id,
      personId: r.personId,
      questionId: r.questionId,
      correct: r.correct,
      askedAt: r.askedAt,
    })),
  }
}

export async function addPerson(name: string) {
  await requireAccess()
  const trimmed = name.trim()
  if (!trimmed) return
  await db.insert(people).values({ id: uid(), name: trimmed, createdAt: Date.now() })
}

export async function removePerson(personId: string) {
  await requireAccess()
  await db.delete(responses).where(eq(responses.personId, personId))
  await db.delete(people).where(eq(people.id, personId))
}

export async function updateQuestion(
  questionId: string,
  patch: { text?: string; answer?: string },
) {
  await requireAccess()
  const set: Partial<{ text: string; answer: string }> = {}
  if (typeof patch.text === "string") set.text = patch.text
  if (typeof patch.answer === "string") set.answer = patch.answer
  if (Object.keys(set).length === 0) return
  await db.update(questions).set(set).where(eq(questions.id, questionId))
}

export async function recordResponse(
  personId: string,
  questionId: string,
  correct: boolean,
) {
  await requireAccess()
  // Guard: don't record a question already answered by this person.
  const already = await db
    .select({ id: responses.id })
    .from(responses)
    .where(and(eq(responses.personId, personId), eq(responses.questionId, questionId)))
  if (already.length) return
  await db.insert(responses).values({
    id: uid(),
    personId,
    questionId,
    correct,
    askedAt: Date.now(),
  })
}

export async function undoResponse(responseId: string) {
  await requireAccess()
  await db.delete(responses).where(eq(responses.id, responseId))
}

export async function resetPerson(personId: string) {
  await requireAccess()
  await db.delete(responses).where(eq(responses.personId, personId))
}
