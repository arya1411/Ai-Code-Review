import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import { GitPullRequest, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await requireAuth()

  const stats = [
    { label: "Open reviews", value: "0" },
    { label: "Connected repositories", value: "0" },
    { label: "Issues detected", value: "0" },
  ]

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
          <FadeIn>
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Welcome back, {session.user.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-neutral-400">
                Your AI code review workspace is active.
              </p>
            </header>
          </FadeIn>

          <FadeIn delay={0.08}>
            <section className="mt-12 grid gap-px border-y border-neutral-900 bg-neutral-900 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-black py-8 px-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>
          </FadeIn>

          <FadeIn delay={0.16}>
            <section className="mt-12">
              <h2 className="text-sm font-medium text-neutral-400">
                Recent Activity
              </h2>

              <div className="mt-4 rounded-lg border border-neutral-900 bg-neutral-950/30 px-6 py-16">
                <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                    <GitPullRequest className="size-5" />
                  </div>
                  <h3 className="mt-6 text-sm font-medium text-white">No reviews found</h3>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                    Connect your GitHub repository to get started with automated AI reviews.
                  </p>
                  <Button 
                    render={<Link href="/repositories" />}
                    size="sm" 
                    className="mt-6 gap-1.5 bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    Connect repository
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </section>
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
