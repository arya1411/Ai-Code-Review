import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import { GitPullRequest, ArrowRight, FolderGit2, GitCommit, Sparkles } from "lucide-react"
import Link from "next/link"
import { QueryProvider } from "@/components/providers/query-provider"

const MOCK_HEIGHTS = [
  45, 60, 30, 80, 50, 75, 40, 90, 65, 35, 70, 85, 25, 60, 55, 30, 80, 45, 75, 50, 90, 40, 65, 35, 70, 85, 25, 60, 55, 30
]

export default async function DashboardPage() {
  // Get the authenticated user session
  const session = await requireAuth()

  // Dashboard statistics - these would typically come from the database/API
  const stats = [
    { 
      label: "Total Repositories", 
      value: "12", 
      icon: FolderGit2,
      description: "Connected repositories"
    },
    { 
      label: "Total Commits", 
      value: "1,248", 
      icon: GitCommit,
      description: "Commits analyzed"
    },
    { 
      label: "Pull Requests", 
      value: "89", 
      icon: GitPullRequest,
      description: "PRs reviewed"
    },
    { 
      label: "AI Reviews", 
      value: "342", 
      icon: Sparkles,
      description: "AI-generated reviews"
    },
  ]

  // Recent activity data - would typically come from the database/API
  const recentActivity = [
    {
      id: 1,
      type: "review",
      repository: "acme/frontend",
      pr: "#142 - Add user authentication",
      status: "completed",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "review",
      repository: "acme/backend",
      pr: "#89 - Fix API rate limiting",
      status: "completed",
      time: "5 hours ago"
    },
    {
      id: 3,
      type: "review",
      repository: "acme/docs",
      pr: "#23 - Update API documentation",
      status: "in_progress",
      time: "1 day ago"
    },
  ]

  return (
    <QueryProvider>
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          {/* Dashboard Header Section */}
          <FadeIn>
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Overview
              </h1>
              <p className="text-sm text-neutral-400">
                Welcome back, {session.user.name.split(" ")[0]}. {"Here's what's happening with your repositories."}
              </p>
            </header>
          </FadeIn>

          {/* Statistics Cards Section */}
          <FadeIn delay={0.08}>
            <section className="mt-10">
              <h2 className="text-sm font-medium text-neutral-400 mb-4">
                Statistics
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div 
                      key={stat.label} 
                      className="rounded-lg border border-neutral-900 bg-neutral-950/50 p-6 hover:bg-neutral-950/70 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex size-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                          <Icon className="size-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-semibold tracking-[-0.02em] text-white">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm font-medium text-neutral-300">
                          {stat.label}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </FadeIn>

          {/* Contribution Activity Section */}
          <FadeIn delay={0.12}>
            <section className="mt-10">
              <h2 className="text-sm font-medium text-neutral-400 mb-4">
                Contribution Activity
              </h2>
              <div className="rounded-lg border border-neutral-900 bg-neutral-950/50 p-6">
                {/* Placeholder for contribution graph - this would be a real chart component */}
                <div className="flex items-center justify-between h-40">
                  <div className="flex items-end gap-1 h-full w-full">
                    {/* Simulated contribution bars */}
                    {MOCK_HEIGHTS.map((height, i) => {
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-sm"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                      )
                    })}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            </section>
          </FadeIn>

          {/* Recent Activity Section */}
          <FadeIn delay={0.16}>
            <section className="mt-10">
              <h2 className="text-sm font-medium text-neutral-400 mb-4">
                Recent Activity
              </h2>

              {recentActivity.length > 0 ? (
                <div className="rounded-lg border border-neutral-900 bg-neutral-950/50 divide-y divide-neutral-900">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-center justify-between p-4 hover:bg-neutral-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                          <GitPullRequest className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {activity.repository}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {activity.pr}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-medium ${
                          activity.status === 'completed' 
                            ? 'text-green-400' 
                            : 'text-amber-400'
                        }`}>
                          {activity.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state when no activity exists
                <div className="rounded-lg border border-neutral-900 bg-neutral-950/30 px-6 py-16">
                  <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                    <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                      <GitPullRequest className="size-5" />
                    </div>
                    <h3 className="mt-6 text-sm font-medium text-white">No recent activity</h3>
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
              )}
            </section>
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
    </QueryProvider>
  )
}
