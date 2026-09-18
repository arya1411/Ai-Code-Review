import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { getConnectedRepositories } from "@/module/repository"
import { RepositoryChat } from "@/module/ai/components/repository-chat"

export default async function ChatPage() {
  const session = await requireAuth()
  const repositories = await getConnectedRepositories()

  return (
    <AppBackground>
      <DashboardShell
        user={session.user}
        className="h-[calc(100vh-3.5rem)] overflow-hidden md:h-screen"
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
