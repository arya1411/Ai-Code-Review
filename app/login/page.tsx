import { LoginUI } from "@/components/ui/LoginUI"
import { requireUnAuth } from "@/module/auth/utils/auth-utils"

export default async function LoginPage() {
  await requireUnAuth()
  return <LoginUI />
}
