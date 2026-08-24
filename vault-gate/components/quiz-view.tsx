"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, X, Eye, EyeOff, Shuffle, RotateCcw, PartyPopper, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  actions,
  personResponses,
  pickRandom,
  TOTAL_QUESTIONS,
  unansweredQuestions,
  useAppData,
} from "@/lib/store"
import type { Question } from "@/lib/types"

export function QuizView() {
  const data = useAppData()
  const [personId, setPersonId] = useState<string>("")
  const [current, setCurrent] = useState<Question | null>(null)
  const [revealed, setRevealed] = useState(false)

  const selectedPerson = data.people.find((p) => p.id === personId) ?? null
  const remaining = useMemo(
    () => (personId ? unansweredQuestions(data, personId) : []),
    [data, personId],
  )
  const answered = personId ? personResponses(data, personId) : []
  const answeredCount = answered.length
  const correctCount = answered.filter((r) => r.correct).length

  // Pick a fresh question whenever the current one is gone (new person, or just answered).
  useEffect(() => {
    if (!personId) {
      setCurrent(null)
      return
    }
    const stillValid = current && remaining.some((q) => q.id === current.id)
    if (!stillValid) {
      setCurrent(pickRandom(remaining))
      setRevealed(false)
    }
  }, [personId, remaining, current])

  function handleRecord(correct: boolean) {
    if (!personId || !current) return
    actions.recordResponse(personId, current.id, correct)
    // useEffect will auto-advance to the next unanswered question.
  }

  function drawAnother() {
    const others = remaining.filter((q) => q.id !== current?.id)
    setCurrent(pickRandom(others.length ? others : remaining))
    setRevealed(false)
  }

  if (data.people.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-6" />}
        title="No people yet"
        body="Head to the Manage tab to add the people in your organisation. Then come back here to start asking questions."
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Person picker */}
      <div className="flex flex-col gap-2">
        <label htmlFor="person" className="text-sm font-medium text-muted-foreground">
          Who are you quizzing?
        </label>
        <select
          id="person"
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base font-medium text-card-foreground outline-none ring-ring/50 transition focus-visible:ring-2"
        >
          <option value="">Select a person…</option>
          {data.people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPerson && (
        <>
          {/* Progress */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{selectedPerson.name}</span>
              <span className="text-muted-foreground">
                {answeredCount}/{TOTAL_QUESTIONS} asked · {correctCount} correct
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-chart-1 to-chart-5 transition-all"
                style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>

          {/* Question card or done state */}
          {current ? (
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                  Question
                </span>
                <button
                  type="button"
                  onClick={drawAnother}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <Shuffle className="size-4" />
                  Draw another
                </button>
              </div>

              <p className="text-pretty text-xl font-semibold leading-relaxed">{current.text}</p>

              <div className="rounded-xl border border-dashed border-border bg-muted/50 p-4">
                <button
                  type="button"
                  onClick={() => setRevealed((v) => !v)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {revealed ? "Hide expected answer" : "Reveal expected answer"}
                </button>
                {revealed && (
                  <p className="mt-3 text-pretty leading-relaxed text-foreground">{current.answer}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  onClick={() => handleRecord(false)}
                  className="h-14 bg-destructive text-base font-semibold text-white hover:bg-destructive/90"
                >
                  <X className="size-5" />
                  Incorrect
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleRecord(true)}
                  className="h-14 bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
                >
                  <Check className="size-5" />
                  Correct
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                <PartyPopper className="size-7" />
              </div>
              <div>
                <p className="text-lg font-semibold">All {TOTAL_QUESTIONS} questions asked!</p>
                <p className="mt-1 text-muted-foreground">
                  {selectedPerson.name} scored {correctCount}/{TOTAL_QUESTIONS}.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm(`Reset all answers for ${selectedPerson.name}?`)) {
                    actions.resetPerson(selectedPerson.id)
                  }
                }}
              >
                <RotateCcw className="size-4" />
                Reset {selectedPerson.name}
              </Button>
            </div>
          )}

          {/* Recent answers for this person */}
          {answered.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">This person&apos;s answers</p>
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {[...answered].reverse().map((r) => {
                  const q = data.questions.find((q) => q.id === r.questionId)
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                          r.correct
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {r.correct ? <Check className="size-4" /> : <X className="size-4" />}
                      </span>
                      <span className="flex-1 truncate text-sm">{q?.text ?? "Deleted question"}</span>
                      <button
                        type="button"
                        onClick={() => actions.undoResponse(r.id)}
                        className="text-xs text-muted-foreground transition hover:text-foreground"
                      >
                        Undo
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-pretty leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
