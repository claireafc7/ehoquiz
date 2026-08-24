"use client"

import { useState } from "react"
import { ClipboardList, Trophy, LineChart, Settings2, LogOut } from "lucide-react"
import { QuizView } from "@/components/quiz-view"
import { LeaderboardView } from "@/components/leaderboard-view"
import { TrendsView } from "@/components/trends-view"
import { ManageView } from "@/components/manage-view"
import { signOut } from "@/app/actions/auth"

type Tab = "quiz" | "leaderboard" | "trends" | "manage"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "quiz", label: "Quiz", icon: <ClipboardList className="size-4" /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="size-4" /> },
  { id: "trends", label: "Trends", icon: <LineChart className="size-4" /> },
  { id: "manage", label: "Manage", icon: <Settings2 className="size-4" /> },
]

const TITLES: Record<Tab, string> = {
  quiz: "Ask a question",
  leaderboard: "Leaderboard",
  trends: "Answer trends",
  manage: "Manage people & questions",
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("quiz")

  return (
    <div className="min-h-dvh bg-gradient-to-b from-accent/50 via-background to-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="h-1 w-full bg-gradient-to-r from-chart-1 via-chart-5 to-success" />
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-chart-1 to-chart-5 text-primary-foreground shadow-sm shadow-primary/30">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-chart-1 to-chart-5 bg-clip-text text-base font-bold leading-none text-transparent">
                5152 Staff EHO Quiz
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </nav>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="sr-only">{TITLES[tab]}</h2>
        {tab === "quiz" && <QuizView />}
        {tab === "leaderboard" && <LeaderboardView />}
        {tab === "trends" && <TrendsView />}
        {tab === "manage" && <ManageView />}
      </main>
    </div>
  )
}
