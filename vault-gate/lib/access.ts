import { cookies } from "next/headers"

// Shared access code to enter the app.
export const ACCESS_CODE = "5152"
export const ACCESS_COOKIE = "ees_access"
// Value stored in the cookie once the correct code is entered.
export const ACCESS_TOKEN = "granted"

export async function hasAccess(): Promise<boolean> {
  const store = await cookies()
  return store.get(ACCESS_COOKIE)?.value === ACCESS_TOKEN
}

export async function requireAccess() {
  if (!(await hasAccess())) throw new Error("Unauthorized")
}
