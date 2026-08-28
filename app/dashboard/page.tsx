import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import {
  GitPullRequest,
  ArrowRight,
  FolderGit2,
  GitCommit,
  Sparkles,
  Settings,
  Zap,
  CheckCircle2,
  AlertCircle,
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
      {action ?? (
        <Settings className="size-3.5 text-neutral-700 hover:text-neutral-500 cursor-pointer transition-colors" />
      )}
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
                  i === 2 ? "/dashboard/repository" :
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
                    label="Total Repositories"
                    sub="GitHub repos connected"
                    value={stats.totalRepos}
                  />
                  <StatRow
                    label="Total Commits"
                    sub="Contributions this year"
                    value={stats.totalCommits.toLocaleString()}
                  />
                  <StatRow
                    label="Pull Requests"
                    sub="PRs reviewed by AI"
                    value={stats.totalPrs}
                  />
                  <StatRow
                    label="AI Reviews"
                    sub="Auto-generated reviews"
                    value="342"
                    trend="↑ Powered by Gemini 2.0 Flash"
                  />
                </div>

                {/* Center — monthly chart */}
                <div className="px-5 py-4">
                  <PanelHeader title="Activity" />
                  <div className="h-[280px]">
                    <MonthlyActivityChart />
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
                        render={<Link href="/dashboard/repository" />}
                        size="sm"
                        className="mt-3 gap-1 text-[10px] bg-white text-black hover:bg-neutral-200"
                      >
                        Connect repo <ArrowRight className="size-2.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Ticker strip (like better-auth live events) ── */}
              <div className="border-y border-neutral-900 bg-neutral-950/40 overflow-hidden h-8 flex items-center">
                <div className="flex gap-8 animate-[marquee_30s_linear_infinite] whitespace-nowrap px-4">
                  {[
                    "PR analysis complete · feat/auth-refresh",
                    "Webhook received · repo: code_review",
                    "RAG index updated · 1,240 chunks",
                    "Security scan passed · no critical issues",
                    "New commit detected · main branch",
                    "AI review posted · PR #312",
                    "PR analysis complete · feat/auth-refresh",
                    "Webhook received · repo: code_review",
                    "RAG index updated · 1,240 chunks",
                    "Security scan passed · no critical issues",
                  ].map((msg, i) => (
                    <span key={i} className="text-[10px] text-neutral-600 shrink-0">
                      <span className="text-neutral-800 mr-2">·</span>
                      {msg}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── BOTTOM ROW: Contribution graph | Commits | Insights ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_260px] divide-y lg:divide-y-0 lg:divide-x divide-neutral-900">

                {/* Contribution graph */}
                <div className="px-5 py-4">
                  <PanelHeader title="Contribution Activity" />
                  <ContributionGraph />
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

                {/* Insights panel */}
                <div className="px-5 py-4">
                  <PanelHeader
                    title="Insights"
                    action={<span className="text-[10px] text-neutral-700">health, version, and config</span>}
                  />

                  <div className="space-y-4">
                    {/* Health */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-2">
                        Health
                      </p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-green-500" />
                        <span className="text-sm font-semibold text-green-400">Healthy</span>
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-0.5">All systems operational</p>
                    </div>

                    {/* Stack */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-2">
                        Stack
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { label: "Next.js", value: "16.2.10" },
                          { label: "Prisma", value: "7.x" },
                          { label: "Inngest", value: "latest" },
                          { label: "Gemini", value: "2.0 Flash" },
                          { label: "Pinecone", value: "Vector DB" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[11px] text-neutral-500">{item.label}</span>
                            <span className="font-mono text-[10px] text-neutral-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Webhook status */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-2">
                        Webhooks
                      </p>
                      <div className="flex items-start gap-1.5">
                        <Zap className="size-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-neutral-500 leading-relaxed">
                          GitHub webhook active at{" "}
                          <span className="font-mono text-neutral-400">/api/webhooks/github</span>
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="size-3.5 text-neutral-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-medium text-neutral-300">
                            Boost accuracy with RAG
                          </p>
                          <p className="mt-0.5 text-[10px] text-neutral-600 leading-relaxed">
                            Connect more repos to expand codebase indexing coverage.
                          </p>
                          <Link
                            href="/dashboard/repository"
                            className="mt-2 inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors"
                          >
                            Manage repos <ArrowRight className="size-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </FadeIn>
          </div>

        </div>
      </DashboardShell>

      {/* marquee keyframe */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </AppBackground>
  )
}
