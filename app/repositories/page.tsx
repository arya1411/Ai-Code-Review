import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import { FolderGit2, ArrowRight } from "lucide-react"

export default async function RepositoriesPage() {
  const session = await requireAuth()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
          <FadeIn>
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Connected repositories
              </h1>
              <p className="text-sm text-neutral-400">
                Manage which repositories codeSentinel has access to.
              </p>
            </header>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="mt-12 rounded-lg border border-neutral-900 bg-neutral-950/30 px-6 py-16">
              <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                  <FolderGit2 className="size-5" />
                </div>
                <h3 className="mt-6 text-sm font-medium text-white">
                  No repositories connected
                </h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Link your GitHub repositories to enable automated code reviews on every pull request.
                </p>
                <Button size="sm" className="mt-6 gap-1.5 bg-white text-black hover:bg-neutral-200 transition-colors">
                  Connect repository
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
