"use client"

import { useMemo } from "react"
import { Trophy, Medal, Award } from "lucide-react"
import { personResponses, TOTAL_QUESTIONS, useAppData } from "@/lib/store"

export function LeaderboardView() {
  const data = useAppData()

  const rows = useMemo(() => {
    return data.people
      .map((p) => {
        const responses = personResponses(data, p.id)
        const asked = responses.length
        const correct = responses.filter((r) => r.correct).length
        const pct = asked > 0 ? Math.round((correct / asked) * 100) : 0
        return { person: p, asked, correct, pct, complete: asked >= TOTAL_QUESTIONS }
      })
      .sort((a, b) => b.correct - a.correct || b.pct - a.pct || a.person.name.localeCompare(b.person.name))
  }, [data])

  if (data.people.length === 0) {
    return (
      <p className="mx-auto max-w-md text-center text-muted-foreground">
        Add people in the Manage tab to see the leaderboard.
      </p>
    )
  }

  const rankStyles = [
    { bg: "bg-gradient-to-r from-chart-3/15 to-card ring-chart-3/60", icon: <Trophy className="size-5 text-chart-3" /> },
    { bg: "bg-gradient-to-r from-muted-foreground/10 to-card ring-muted-foreground/40", icon: <Medal className="size-5 text-muted-foreground" /> },
    { bg: "bg-gradient-to-r from-chart-4/15 to-card ring-chart-4/50", icon: <Award className="size-5 text-chart-4" /> },
  ]

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      {rows.map((row, i) => {
        const rank = rankStyles[i]
        return (
          <div
            key={row.person.id}
            className={`flex items-center gap-4 rounded-xl border border-border p-4 ${
              rank ? `ring-1 ${rank.bg}` : "bg-card"
            }`}
          >
            <div className="flex size-9 shrink-0 items-center justify-center">
              {rank ? rank.icon : <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{row.person.name}</span>
                {row.complete && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    Done
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {row.correct} correct · {row.asked}/{TOTAL_QUESTIONS} asked · {row.pct}% accuracy
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-bold tabular-nums">{row.correct}</span>
              <span className="text-sm text-muted-foreground">/{TOTAL_QUESTIONS}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
