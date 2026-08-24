"use client"

import { useActionState } from "react"
import { ClipboardList, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "@/app/actions/auth"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, {})

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-accent/50 via-background to-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-chart-5 text-primary-foreground shadow-sm shadow-primary/30">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-chart-1 to-chart-5 bg-clip-text text-lg font-bold text-transparent">
              Staff EHO Quiz
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter the access code to continue</p>
          </div>
        </div>

        <form
          action={formAction}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm font-medium text-muted-foreground">
              Access code
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="code"
                name="code"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="••••"
                className="h-12 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-base tracking-widest outline-none ring-ring/50 transition focus-visible:ring-2"
              />
            </div>
            {state?.error && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {state.error}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="h-12 text-base font-semibold" disabled={pending}>
            {pending ? "Checking…" : "Enter"}
          </Button>
        </form>
      </div>
    </div>
  )
}
