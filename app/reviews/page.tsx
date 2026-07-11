import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { GitPullRequest } from "lucide-react"

export default async function ReviewsPage() {
  const session = await requireAuth()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
          <FadeIn>
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Pull request reviews
              </h1>
              <p className="text-sm text-neutral-400">
                AI-assisted reviews for your open pull requests.
              </p>
            </header>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="mt-12 rounded-lg border border-neutral-900 bg-neutral-950/30 px-6 py-16">
              <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                  <GitPullRequest className="size-5" />
                </div>
                <h3 className="mt-6 text-sm font-medium text-white">No open reviews</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Reviews will appear here once you connect a repository and open a pull request.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
