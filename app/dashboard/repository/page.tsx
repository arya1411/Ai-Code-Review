import React from 'react'
import { AppBackground } from '@/components/layout/app-background'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { requireAuth } from '@/module/auth/utils/auth-utils'
import { RepositoryList } from '@/module/repository/components/repository-list'

export default async function RepositoryPage() {
  const session = await requireAuth()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <RepositoryList />
      </DashboardShell>
    </AppBackground>
  )
}

