import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Avatar } from "@/components/ui/avatar"
import Logout from "@/components/ui/logout"
import { getConnectedRepositories, getUserProfile } from "@/module/settings"
import { DisconnectButton } from "@/module/settings/components/disconnect-button"
import { ExternalLink, FolderGit2 } from "lucide-react"

export default async function SettingsPage() {
  const session = await requireAuth()
  const [repositories, profile] = await Promise.all([
    getConnectedRepositories(),
    getUserProfile(),
  ])

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
            <section className="mt-12 max-w-2xl mx-auto divide-y divide-neutral-900 border-y border-neutral-900">
              {/* Profile Details */}
              <div className="flex flex-row items-center justify-between gap-4 py-6">
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
                    {profile?.createdAt && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Control */}
              <div className="flex flex-row items-center justify-between gap-4 py-6">
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

          {/* Connected Repositories */}
          <FadeIn delay={0.14}>
            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-sm font-medium text-white">Connected Repositories</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Repositories with active AI code review webhooks.
                </p>
              </div>

              {repositories.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-900 bg-neutral-950/30 py-14 text-center px-4">
                  <div className="flex size-11 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                    <FolderGit2 className="size-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-white">No repositories connected</h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Go to the Repositories page to connect your first repository.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-900 bg-neutral-950/40 divide-y divide-neutral-900">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="size-4 shrink-0 text-neutral-500" />
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm font-medium text-white hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                          >
                            {repo.fullName}
                            <ExternalLink className="size-3 text-neutral-500 shrink-0" />
                          </a>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500 pl-6">
                          Connected {new Date(repo.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                      <DisconnectButton
                        repositoryId={repo.id}
                        repositoryName={repo.name}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
