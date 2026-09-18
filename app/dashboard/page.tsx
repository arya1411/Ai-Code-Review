import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import {
  GitPullRequest,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { getDashboardStats } from "@/module/dashboard"
import ContributionGraph from "@/module/dashboard/components/contribution-graph"
import MonthlyActivityChart from "@/module/dashboard/components/monthly-activity-chart"
import RecentCommits from "@/module/dashboard/components/recent-commits"
import { Suspense } from "react"

/* ── tiny widget helpers ─────────────────────────────────────────── */

function PanelHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600">
        {title}
      </span>
      {action}
    </div>
  )
}

function StatRow({
  label,
  sub,
  value,
  trend,
}: {
  label: string
  sub: string
  value: string | number
  trend?: string
}) {
  return (
    <div className="border-b border-neutral-900 py-4 last:border-0">
      <p className="text-[11px] font-medium text-neutral-400">{label}</p>
      <p className="text-[10px] text-neutral-700 mb-2">{sub}</p>
      <p className="text-3xl font-bold tracking-[-0.04em] text-white">{value}</p>
      {trend && (
        <p className="mt-1 text-[10px] text-neutral-600">{trend}</p>
      )}
    </div>
  )
}

/* ── page ────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const session = await requireAuth()
  const stats = await getDashboardStats()
  const recentActivity = stats.recentActivity

  const today = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="flex flex-col h-full">

          {/* ── Top tab bar ── */}
          <div className="shrink-0 flex items-center gap-6 border-b border-neutral-900 bg-black px-6 h-10">
            {["OVERVIEW", "REVIEWS", "REPOSITORIES", "ACTIVITY"].map((tab, i) => (
              <Link
                key={tab}
                href={
                  i === 0 ? "/dashboard" :
                  i === 1 ? "/reviews" :
                  i === 2 ? "/repositories" :
                  "/dashboard"
                }
                className={`text-[11px] font-semibold tracking-widest transition-colors ${
                  i === 0
                    ? "text-white border-b border-white pb-[1px]"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                {tab}
              </Link>
            ))}
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-auto">
            <FadeIn>
              {/* Page header */}
              <div className="border-b border-neutral-900 px-6 py-4">
                <h1 className="text-sm font-semibold text-white">
                  Welcome Back, {session.user.name}
                </h1>
                <p className="text-[11px] text-neutral-600 mt-0.5">{today}</p>
              </div>

              {/* ── TOP ROW: Stats | Chart | Recent PRs ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-neutral-900">

                {/* Left — stat rows */}
                <div className="px-5 py-4">
                  <PanelHeader title="Daily" />

                  <StatRow
                    label="Connected Repositories"
                    sub="Repositories indexed by codeSentinel"
                    value={stats.connectedRepositories}
                  />
                  <StatRow
                    label="Total Contributions"
                    sub="GitHub contributions this year"
                    value={stats.totalCommits.toLocaleString()}
                  />
                  <StatRow
                    label="Pull Requests"
                    sub="PRs authored on GitHub"
                    value={stats.totalPrs}
                  />
                  <StatRow
                    label="AI Reviews"
                    sub="Completed by codeSentinel"
                    value={stats.aiReviews}
                  />
                </div>

                {/* Center — contribution graph */}
                <div className="px-5 py-4">
                  <PanelHeader title="Contribution Activity" />
                  <div className="h-[280px] flex items-center justify-center">
                    <ContributionGraph />
                  </div>
                </div>

                {/* Right — recent PRs */}
                <div className="px-5 py-4">
                  <PanelHeader title="Recent PRs" />

                  {recentActivity.length > 0 ? (
                    <div className="space-y-0 divide-y divide-neutral-900">
                      {/* Column headers */}
                      <div className="grid grid-cols-[1fr_60px] pb-1.5 mb-1">
                        <span className="text-[10px] text-neutral-700">Repository</span>
                        <span className="text-[10px] text-neutral-700 text-right">Status</span>
                      </div>

                      {recentActivity.map((a) => (
                        <div key={a.id} className="grid grid-cols-[1fr_60px] py-2.5 items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-neutral-300 truncate leading-none">
                              {a.repository}
                            </p>
                            <p className="text-[10px] text-neutral-600 mt-1 truncate">{a.pr}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-[10px] font-medium ${
                                a.status === "completed" ? "text-green-500" : "text-amber-500"
                              }`}
                            >
                              {a.status === "completed" ? "Done" : "Active"}
                            </span>
                            <p className="text-[10px] text-neutral-700 mt-0.5">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <GitPullRequest className="size-6 text-neutral-700 mb-3" />
                      <p className="text-xs text-neutral-500">No recent PRs</p>
                      <Button
                        render={<Link href="/repositories" />}
                        size="sm"
                        className="mt-3 gap-1 text-[10px] bg-white text-black hover:bg-neutral-200"
                      >
                        Connect repo <ArrowRight className="size-2.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── BOTTOM ROW: Monthly activity | Commits ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-900 border-t border-neutral-900">

                {/* Monthly Activity chart */}
                <div className="px-5 py-4">
                  <PanelHeader title="Monthly Activity" />
                  <MonthlyActivityChart />
                </div>

                {/* Latest commits 2×2 */}
                <div className="px-5 py-4">
                  <PanelHeader title="Latest Commits" />
                  <Suspense
                    fallback={
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-neutral-900 bg-neutral-950/50 p-3 space-y-2"
                          >
                            <div className="h-3 w-4/5 rounded bg-neutral-800/60 animate-pulse" />
                            <div className="h-2.5 w-1/2 rounded bg-neutral-800/40 animate-pulse" />
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <RecentCommits limit={4} />
                  </Suspense>
                </div>

              </div>

            </FadeIn>
          </div>

        </div>
      </DashboardShell>

    </AppBackground>
  )
}
