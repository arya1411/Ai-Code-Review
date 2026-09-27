"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, GitBranch, KeyRound, LockKeyhole } from "lucide-react"
import { signIn } from "@/lib/auth-client"
import { Logo } from "@/components/brand/logo"
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
      await signIn.social({ provider: "github" })
    } catch (error) {
      console.error("Login Error", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-shell min-h-screen bg-[#0d0d0c] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6">
          <Logo href="/" size="md" />
          <Link href="/" className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] text-white/38 transition-colors hover:text-white">
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" /> HOME
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-121px)] max-w-5xl items-center px-6 py-12">
        <FadeIn className="w-full">
          <div className="mb-6 flex items-center justify-between font-mono text-[9px] tracking-[0.14em] text-white/25">
            <span>ACCOUNT ACCESS</span>
            <span className="flex items-center gap-2"><LockKeyhole className="size-3 text-[#d7c2a4]" /> GITHUB AUTHENTICATION</span>
          </div>

          <div className="auth-panel grid overflow-hidden border border-white/12 bg-[#11110f] lg:grid-cols-[1.08fr_.92fr]">
            <section className="px-6 py-10 sm:px-10 sm:py-12 lg:border-r lg:border-white/10 lg:px-12 lg:py-14">
              <div className="flex size-10 items-center justify-center border border-white/12 bg-white/[0.025] text-[#d7c2a4]">
                <KeyRound className="size-4" strokeWidth={1.5} />
              </div>

              <p className="mt-9 font-mono text-[9px] tracking-[0.18em] text-[#d7c2a4]">WELCOME BACK</p>
              <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">Sign in to your workspace.</h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/42">
                codeSentinel uses GitHub for identity because your workspace is built around the repositories you connect.
              </p>

              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="login-button group mt-9 flex h-13 w-full max-w-md items-center justify-between bg-[#d7c2a4] px-5 font-mono text-[10px] font-semibold tracking-[0.08em] text-[#17130f] transition-colors hover:bg-[#e4d2b8] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="flex items-center gap-3"><GitHubMark />{isLoading ? "CONNECTING TO GITHUB…" : "CONTINUE WITH GITHUB"}</span>
                <ArrowRight className={`size-4 transition-transform ${isLoading ? "animate-pulse" : "group-hover:translate-x-1"}`} />
              </button>

              <p className="mt-5 max-w-md text-[10px] leading-5 text-white/23">
                By continuing, you agree to our <Link href="#" className="text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white">Terms</Link> and <Link href="#" className="text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white">Privacy Policy</Link>.
              </p>
            </section>

            <aside className="border-t border-white/10 bg-[#0b0b0a] px-6 py-10 sm:px-10 lg:border-t-0 lg:px-9 lg:py-14">
              <div className="flex items-center gap-3">
                <GitBranch className="size-4 text-white/45" />
                <h2 className="font-mono text-[10px] tracking-[0.12em] text-white/65">WHAT HAPPENS NEXT</h2>
              </div>

              <ol className="mt-9 space-y-0">
                {[
                  ["01", "Authenticate", "GitHub confirms your identity. We never receive your password."],
                  ["02", "Choose access", "You decide which repositories codeSentinel can connect to."],
                  ["03", "Enter workspace", "Your dashboard opens with connected repository activity."],
                ].map(([number, title, detail], index) => (
                  <li key={number} className="relative grid grid-cols-[34px_1fr] gap-4 pb-8 last:pb-0">
                    {index < 2 && <span className="absolute bottom-0 left-[13px] top-7 w-px bg-white/10" />}
                    <span className="flex size-7 items-center justify-center border border-[#d7c2a4]/25 bg-[#d7c2a4]/5 font-mono text-[9px] text-[#d7c2a4]">{number}</span>
                    <div>
                      <p className="text-sm text-white/78">{title}</p>
                      <p className="mt-2 text-xs leading-5 text-white/30">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-10 border-t border-white/10 pt-6 font-mono text-[9px] tracking-[0.05em] text-white/30">
                <p><Check className="mr-2 inline size-3 text-[#7ee2b8]" /> NO PASSWORD STORED</p>
                <p className="mt-3"><Check className="mr-2 inline size-3 text-[#7ee2b8]" /> ACCESS CAN BE REVOKED</p>
              </div>
            </aside>
          </div>

          <p className="mt-6 text-center font-mono text-[9px] tracking-[0.08em] text-white/18">
            NEED HELP? <Link href="/docs" className="text-white/38 transition-colors hover:text-white">READ THE CONNECTION GUIDE</Link>
          </p>
        </FadeIn>
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center font-mono text-[9px] tracking-[0.12em] text-white/18">
        © {new Date().getFullYear()} CODESENTINEL
      </footer>
    </div>
  )
}
