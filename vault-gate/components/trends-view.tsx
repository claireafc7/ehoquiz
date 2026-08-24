"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, Target, ListChecks } from "lucide-react"
import { TOTAL_QUESTIONS, useAppData } from "@/lib/store"

export function TrendsView() {
  const data = useAppData()

  const perQuestion = useMemo(() => {
    return data.questions
      .map((q) => {
        const rs = data.responses.filter((r) => r.questionId === q.id)
        const asked = rs.length
        const correct = rs.filter((r) => r.correct).length
        const pct = asked > 0 ? Math.round((correct / asked) * 100) : null
        return { question: q, asked, correct, wrong: asked - correct, pct }
      })
      .sort((a, b) => {
        if (a.pct === null) return 1
        if (b.pct === null) return -1
        return a.pct - b.pct
      })
  }, [data])

  const totals = useMemo(() => {
    const asked = data.responses.length
    const correct = data.responses.filter((r) => r.correct).length
    const answered = perQuestion.filter((q) => q.pct !== null)
    const worst = answered.length ? answered[0] : null
    const best = answered.length ? answered[answered.length - 1] : null
    return {
      asked,
      accuracy: asked > 0 ? Math.round((correct / asked) * 100) : 0,
      worst,
      best,
    }
  }, [data, perQuestion])

  if (data.responses.length === 0) {
    return (
      <p className="mx-auto max-w-md text-center text-muted-foreground">
        No answers recorded yet. Once you start quizzing people, trends across every question show up
        here.
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          tint="indigo"
          icon={<ListChecks className="size-4" />}
          label="Answers logged"
          value={String(totals.asked)}
        />
        <StatCard
          tint="blue"
          icon={<Target className="size-4" />}
          label="Overall accuracy"
          value={`${totals.accuracy}%`}
        />
        <StatCard
          tint="red"
          icon={<TrendingDown className="size-4" />}
          label="Worst answered"
          value={totals.worst ? `${totals.worst.pct}%` : "—"}
          sub={totals.worst?.question.text}
        />
        <StatCard
          tint="green"
          icon={<TrendingUp className="size-4" />}
          label="Best answered"
          value={totals.best ? `${totals.best.pct}%` : "—"}
          sub={totals.best?.question.text}
        />
      </div>

      {/* Per-question breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Accuracy by question (worst answered first)
        </h2>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          {perQuestion.map((q) => {
            const correctPct = q.asked > 0 ? (q.correct / q.asked) * 100 : 0
            const wrongPct = q.asked > 0 ? (q.wrong / q.asked) * 100 : 0
            return (
              <div key={q.question.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{q.question.text}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {q.pct === null ? "not asked" : `${q.correct}/${q.asked}`}
                  </span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-success" style={{ width: `${correctPct}%` }} />
                  <div className="h-full bg-destructive" style={{ width: `${wrongPct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-success" /> Correct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive" /> Incorrect
          </span>
          <span className="ml-auto">Total questions: {TOTAL_QUESTIONS}</span>
        </div>
      </div>
    </div>
  )
}

const TINTS = {
  indigo: {
    card: "border-primary/20 bg-primary/5",
    chip: "bg-primary/15 text-primary",
  },
  blue: {
    card: "border-chart-5/25 bg-chart-5/5",
    chip: "bg-chart-5/15 text-chart-5",
  },
  red: {
    card: "border-destructive/25 bg-destructive/5",
    chip: "bg-destructive/15 text-destructive",
  },
  green: {
    card: "border-success/25 bg-success/5",
    chip: "bg-success/15 text-success",
  },
} as const

function StatCard({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  tint: keyof typeof TINTS
}) {
  const t = TINTS[tint]
  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${t.card}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={`flex size-7 items-center justify-center rounded-lg ${t.chip}`}>{icon}</span>
        {label}
      </div>
      <span className="font-mono text-2xl font-bold tabular-nums">{value}</span>
      {sub && <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{sub}</p>}
    </div>
  )
}
