import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Avatar } from "@/components/ui/avatar"
import Logout from "@/components/ui/logout"

export default async function SettingsPage() {
  const session = await requireAuth()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
          <FadeIn>
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Account Settings
              </h1>
              <p className="text-sm text-neutral-400">
                Manage your developer profile and session.
              </p>
            </header>
          </FadeIn>

          <FadeIn delay={0.08}>
            <section className="mt-12 max-w-2xl divide-y divide-neutral-900 border-y border-neutral-900">
              {/* Profile Details */}
              <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Profile</h3>
                  <p className="text-sm text-neutral-400 mt-1">Your connected GitHub identity.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={session.user.image}
                    name={session.user.name}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {session.user.name}
                    </p>
                    <p className="truncate text-sm text-neutral-400 mt-1">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Control */}
              <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Session</h3>
                  <p className="text-sm text-neutral-400 mt-1">Logout from your current session.</p>
                </div>
                <Logout className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950 px-4 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white cursor-pointer">
                  Sign out
                </Logout>
              </div>
            </section>
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
