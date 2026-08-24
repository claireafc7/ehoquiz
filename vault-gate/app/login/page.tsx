import { redirect } from "next/navigation"
import { hasAccess } from "@/lib/access"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  if (await hasAccess()) redirect("/")
  return <LoginForm />
}
