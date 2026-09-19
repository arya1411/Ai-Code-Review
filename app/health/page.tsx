import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  FileWarning,
  GitPullRequest,
  ShieldCheck,
} from "lucide-react"
import { AppBackground } from "@/components/layout/app-background"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { FadeIn } from "@/components/ui/fade-in"
import { requireAuth } from "@/module/auth/utils/auth-utils"
import { getRepositoryHealth } from "@/module/health"
import { FindingCategoryChart, RiskTrendChart } from "@/module/health/components/health-charts"

const indexStyles = {
  READY: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  INDEXING: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-400",
  NOT_INDEXED: "border-neutral-700 bg-neutral-900 text-neutral-400",
} as const

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  detail: string
  icon: typeof Activity
  accent: string
}) {
  return (
    <div className="border-b border-neutral-900 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">{label}</p>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-1 text-[11px] text-neutral-600">{detail}</p>
    </div>
  )
}

function SectionHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {detail && <p className="mt-1 text-[11px] text-neutral-600">{detail}</p>}
      </div>
    </div>
  )
}

export default async function HealthPage() {
  const session = await requireAuth()
  const health = await getRepositoryHealth()
  const indexedPercent = health.summary.repositories === 0
    ? 0
    : Math.round((health.summary.readyRepositories / health.summary.repositories) * 100)
  const riskTotal = Object.values(health.riskDistribution).reduce((total, count) => total + count, 0)

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="min-h-full">
          <div className="border-b border-neutral-900 px-6 py-5 md:px-8">
            <FadeIn>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                    <Activity className="size-3.5" /> Repository intelligence
                  </div>
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">Health dashboard</h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                    Index reliability, review risk, recurring findings, and the files that need attention most.
                  </p>
                </div>
                <Link href="/reviews" className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white">
                  Open all reviews <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.04}>
            <div className="grid border-b border-neutral-900 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Index coverage"
                value={`${indexedPercent}%`}
                detail={`${health.summary.readyRepositories} of ${health.summary.repositories} repositories ready`}
                icon={ShieldCheck}
                accent="text-emerald-400"
              />
              <MetricCard
                label="Average risk"
                value={health.summary.averageRisk ?? "—"}
                detail={health.summary.averageRisk === null ? "No scored reviews yet" : "Across completed AI reviews"}
                icon={Activity}
                accent="text-violet-400"
              />
              <MetricCard
                label="Completed reviews"
                value={health.summary.completedReviews}
                detail={`${health.summary.failedReviews} failed review${health.summary.failedReviews === 1 ? "" : "s"}`}
                icon={GitPullRequest}
                accent="text-blue-400"
              />
              <MetricCard
                label="High findings"
                value={health.summary.highFindings}
                detail={`${health.summary.totalFindings} findings recorded`}
                icon={FileWarning}
                accent="text-red-400"
              />
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-[1.35fr_1fr]">
            <FadeIn delay={0.08} className="border-b border-neutral-900 p-6 md:p-8 lg:border-r">
              <SectionHeader title="Risk trend" detail="Average AI risk score across the last six months" />
              <RiskTrendChart data={health.trend} />
            </FadeIn>

            <FadeIn delay={0.1} className="border-b border-neutral-900 p-6 md:p-8">
              <SectionHeader title="Risk distribution" detail="Completed reviews by assigned risk level" />
              <div className="space-y-5 pt-2">
                {([
                  ["HIGH", health.riskDistribution.HIGH, "bg-red-500", "text-red-400"],
                  ["MEDIUM", health.riskDistribution.MEDIUM, "bg-amber-500", "text-amber-400"],
                  ["LOW", health.riskDistribution.LOW, "bg-emerald-500", "text-emerald-400"],
                ] as const).map(([label, count, barClass, textClass]) => {
                  const percentage = riskTotal === 0 ? 0 : Math.round((count / riskTotal) * 100)
                  return (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className={`font-semibold ${textClass}`}>{label}</span>
                        <span className="text-neutral-500">{count} · {percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-900">
                        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </FadeIn>
          </div>

          <div className="grid lg:grid-cols-2">
            <FadeIn delay={0.12} className="border-b border-neutral-900 p-6 md:p-8 lg:border-r">
              <SectionHeader title="Finding categories" detail="The most common issue types in recent reviews" />
              <FindingCategoryChart data={health.categories} />
            </FadeIn>

            <FadeIn delay={0.14} className="border-b border-neutral-900 p-6 md:p-8">
              <SectionHeader title="Needs attention" detail="Index failures and recently detected high-risk changes" />
              {health.attentionItems.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <CheckCircle2 className="size-7 text-emerald-500/70" />
                  <p className="mt-3 text-sm font-medium text-neutral-300">Nothing urgent</p>
                  <p className="mt-1 text-xs text-neutral-600">High-risk reviews and failed indexes will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {health.attentionItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-red-500/20 bg-red-500/10 text-red-400">
                        <CircleAlert className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">{item.type}</span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-neutral-300 group-hover:text-white">{item.title}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-neutral-600">{item.detail}</span>
                      </span>
                      <ArrowUpRight className="mt-1 size-3.5 text-neutral-700 group-hover:text-neutral-400" />
                    </Link>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>

          <FadeIn delay={0.16} className="border-b border-neutral-900 p-6 md:p-8">
            <SectionHeader title="Repository health" detail="Repositories ranked by indexing failures, high findings, and average review risk" />
            {health.repositories.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-800 px-6 py-12 text-center">
                <p className="text-sm text-neutral-400">No repositories connected.</p>
                <Link href="/repositories" className="mt-2 inline-flex text-xs text-violet-400 hover:text-violet-300">Connect a repository</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-900 text-[10px] uppercase tracking-wider text-neutral-700">
                      <th className="pb-3 font-medium">Repository</th>
                      <th className="pb-3 font-medium">Index</th>
                      <th className="pb-3 text-right font-medium">Reviews</th>
                      <th className="pb-3 text-right font-medium">Avg. risk</th>
                      <th className="pb-3 text-right font-medium">High findings</th>
                      <th className="pb-3 text-right font-medium">Last review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {health.repositories.map((repository) => (
                      <tr key={repository.id} className="text-xs">
                        <td className="py-3.5 pr-4">
                          <a href={repository.url} target="_blank" rel="noreferrer" className="font-medium text-neutral-300 hover:text-white">
                            {repository.fullName}
                          </a>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${indexStyles[repository.indexStatus]}`}>
                            {repository.indexStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-neutral-500">{repository.reviewCount}</td>
                        <td className="py-3.5 text-right font-medium text-neutral-300">{repository.averageRisk ?? "—"}</td>
                        <td className={`py-3.5 text-right font-medium ${repository.highFindings > 0 ? "text-red-400" : "text-neutral-600"}`}>{repository.highFindings}</td>
                        <td className="py-3.5 text-right text-neutral-600">
                          {repository.lastReviewAt
                            ? formatDistanceToNow(repository.lastReviewAt, { addSuffix: true })
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.18} className="p-6 md:p-8">
            <SectionHeader title="Risky files" detail={`Hotspots calculated from up to ${health.analyzedReviewLimit} recent reviews`} />
            {health.riskyFiles.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-800 px-6 py-12 text-center text-xs text-neutral-600">
                File hotspots will appear after reviews produce findings.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {health.riskyFiles.map((file) => (
                  <div key={`${file.repository}:${file.path}`} className="rounded-lg border border-neutral-900 bg-neutral-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <FileWarning className="mt-0.5 size-4 shrink-0 text-amber-400" />
                      <span className="text-[10px] text-neutral-600">{file.findings} finding{file.findings === 1 ? "" : "s"}</span>
                    </div>
                    <code className="mt-4 block truncate text-xs text-neutral-300" title={file.path}>{file.path}</code>
                    <p className="mt-1 truncate text-[10px] text-neutral-700">{file.repository}</p>
                    <div className="mt-3 flex gap-3 text-[10px]">
                      <span className={file.high > 0 ? "text-red-400" : "text-neutral-700"}>{file.high} high</span>
                      <span className={file.medium > 0 ? "text-amber-400" : "text-neutral-700"}>{file.medium} medium</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FadeIn>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
