"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface LogoutProps {
  children?: React.ReactNode
  className?: string
}

export default function Logout({ children, className }: LogoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        },
      },
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn("cursor-pointer", className)}
    >
      {children || "Sign out"}
    </button>
  )
}
