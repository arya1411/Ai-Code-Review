import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { getConnectedRepositories } from "@/module/repository"
import { RepositoryChat } from "@/module/ai/components/repository-chat"
import { env } from "@/lib/env"
import Link from "next/link"

export const maxDuration = 300

export default async function ChatPage() {
  const session = await requireAuth()
  if (env.REPOSITORY_INDEXING_ENABLED !== "1") {
    return (
      <AppBackground>
        <DashboardShell user={session.user}>
          <div className="mx-auto max-w-3xl space-y-4 px-6 py-14">
            <h1 className="text-2xl font-semibold text-white">Repository chat is paused</h1>
            <p className="text-sm leading-6 text-neutral-400">
              Repository indexing and chat are temporarily paused. Pull request reviews remain available and analyze the changes in each PR.
            </p>
            <Link href="/reviews" className="inline-block text-sm text-white underline underline-offset-4">View pull request reviews</Link>
          </div>
        </DashboardShell>
      </AppBackground>
    )
  }
  const repositories = await getConnectedRepositories()

  return (
    <AppBackground>
      <DashboardShell
        user={session.user}
        className="h-[calc(100dvh-var(--prototype-banner-height)-3.5rem)] overflow-hidden md:h-[calc(100dvh-var(--prototype-banner-height))]"
      >
        <RepositoryChat
          repositories={repositories.map(({ id, name, owner, fullName, url, indexStatus }) => ({
            id,
            name,
            owner,
            fullName,
            url,
            indexStatus,
          }))}
        />
      </DashboardShell>
    </AppBackground>
  )
}
