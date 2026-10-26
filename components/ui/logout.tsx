"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

interface LogoutProps {
  children?: React.ReactNode
  className?: string
}

export default function Logout({ children, className }: LogoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const result = await signOut()
      if (result.error) throw new Error("Sign out failed")
      router.replace("/login")
      router.refresh()
    } catch {
      toast.error("Could not sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={cn("cursor-pointer disabled:cursor-wait disabled:opacity-60", className)}
    >
      {isLoading ? "Signing out…" : children || "Sign out"}
    </button>
  )
}
