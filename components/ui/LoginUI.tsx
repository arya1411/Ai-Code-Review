"use client"

import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { useState } from "react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/fade-in"

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.54 2.87 8.4 6.84 9.77.5.1.68-.22.68-.48v-1.73c-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.07-.63.07-.63 1.02.08 1.56 1.07 1.56 1.07.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.13.64-1.39-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.38-2.04 1.01-2.76-.1-.26-.44-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.24 9.24 0 0 1 12 6.8c.85 0 1.72.12 2.53.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.63.72 1.01 1.64 1.01 2.76 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.83c0 .26.18.58.69.48C19.13 20.65 22 16.79 22 12.25 22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

export function LoginUI() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGithubLogin = async () => {
    setIsLoading(true)

    try {
      await signIn.social({
        provider: "github",
      })
    } catch (error) {
      console.error("Login Error", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo href="/" size="sm" />
        <Link 
          href="/" 
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <FadeIn className="w-full max-w-sm">
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
                Sign in
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Continue with GitHub to access your workspace
              </p>
            </div>

            <Button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full h-10 gap-2 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
            >
              <GitHubMark />
              {isLoading ? "Connecting…" : "Continue with GitHub"}
            </Button>

            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-muted-foreground hover:text-foreground underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-muted-foreground hover:text-foreground underline underline-offset-2">
                Privacy
              </Link>
            </p>
          </div>
        </FadeIn>
      </main>

      <footer className="px-6 py-5 text-center">
        <p className="text-[11px] text-muted-foreground/40">
          © {new Date().getFullYear()} codeSentinel
        </p>
      </footer>
    </div>
  )
}
