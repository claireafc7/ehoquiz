"use client"

import { useState } from "react"
import { Plus, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { actions, personResponses, TOTAL_QUESTIONS, useAppData } from "@/lib/store"

export function ManageView() {
  const data = useAppData()
  const [name, setName] = useState("")

  function addPerson(e: React.FormEvent) {
    e.preventDefault()
    if (e.nativeEvent instanceof KeyboardEvent && (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229))
      return
    actions.addPerson(name)
    setName("")
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
      {/* People */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          People ({data.people.length})
        </h2>
        <form onSubmit={addPerson} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a person's name"
            className="h-11 flex-1 rounded-xl border border-input bg-card px-3.5 text-sm outline-none ring-ring/50 transition focus-visible:ring-2"
          />
          <Button type="submit" className="h-11 shrink-0">
            <UserPlus className="size-4" />
            Add
          </Button>
        </form>

        {data.people.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No people yet. Add everyone who needs to be quizzed.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {data.people.map((p) => {
              const asked = personResponses(data, p.id).length
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asked}/{TOTAL_QUESTIONS} asked
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove ${p.name} and all their answers?`)) actions.removePerson(p.id)
                    }}
                    className="text-muted-foreground transition hover:text-destructive"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Questions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          The {TOTAL_QUESTIONS} Questions
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Edit each question and its expected answer below. These are the {TOTAL_QUESTIONS} questions
          every person gets asked.
        </p>
        <ol className="flex flex-col gap-3">
          {data.questions.map((q, i) => (
            <li key={q.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <input
                  value={q.text}
                  onChange={(e) => actions.updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Question text"
                  className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 transition focus-visible:ring-2"
                />
              </div>
              <input
                value={q.answer}
                onChange={(e) => actions.updateQuestion(q.id, { answer: e.target.value })}
                placeholder="Expected answer"
                className="ml-8 h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground outline-none ring-ring/50 transition focus-visible:ring-2"
              />
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
