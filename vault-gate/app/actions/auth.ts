"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCESS_CODE, ACCESS_COOKIE, ACCESS_TOKEN } from "@/lib/access"

export async function signIn(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const code = String(formData.get("code") ?? "").trim()
  if (code !== ACCESS_CODE) {
    return { error: "Incorrect code. Please try again." }
  }
  const store = await cookies()
  store.set(ACCESS_COOKIE, ACCESS_TOKEN, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  redirect("/")
}

export async function signOut() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  redirect("/login")
}
