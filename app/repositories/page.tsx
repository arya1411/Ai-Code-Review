import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { RepositoryList } from "@/module/repository/components/repository-list"

export default async function RepositoriesPage() {
  const session = await requireAuth()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <RepositoryList />
      </DashboardShell>
    </AppBackground>
  )
}
