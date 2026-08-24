import { NextResponse, type NextRequest } from "next/server"

// Inlined here (not imported from lib/access) so this stays edge-safe and
// doesn't pull in `next/headers`.
const ACCESS_COOKIE = "ees_access"
const ACCESS_TOKEN = "granted"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthed = req.cookies.get(ACCESS_COOKIE)?.value === ACCESS_TOKEN
  const isLogin = pathname === "/login"

  if (!isAuthed && !isLogin) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (isAuthed && isLogin) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}
