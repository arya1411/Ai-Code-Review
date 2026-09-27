import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { getReviews } from "@/module/reviews"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  ExternalLink,
  GitPullRequest,
  Loader2,
  SearchCode,
} from "lucide-react"

const statusDetails = {
  QUEUED: { label: "Queued", icon: Loader2, className: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  ANALYZING: { label: "Analyzing", icon: Loader2, className: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, className: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  FAILED: { label: "Failed", icon: CircleX, className: "text-red-400 border-red-500/20 bg-red-500/10" },
} as const

const riskClasses = {
  LOW: "text-emerald-400 border-emerald-500/20",
  MEDIUM: "text-amber-400 border-amber-500/20",
  HIGH: "text-red-400 border-red-500/20",
} as const

const dashboardTabs = [
  { label: "OVERVIEW", href: "/dashboard" },
  { label: "REVIEWS", href: "/reviews" },
  { label: "REPOSITORIES", href: "/repositories" },
  { label: "ACTIVITY", href: "/dashboard" },
] as const

export default async function ReviewsPage() {
  const session = await requireAuth()
  const reviews = await getReviews()
  const completedReviews = reviews.filter((review) => review.status === "COMPLETED").length
  const activeReviews = reviews.filter((review) => review.status === "QUEUED" || review.status === "ANALYZING").length
  const findings = reviews.reduce((total, review) => total + review.findings.length, 0)
  const highRiskReviews = reviews.filter((review) => review.riskLevel === "HIGH").length

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="flex h-full flex-col">
          <div className="flex h-10 shrink-0 items-center gap-6 overflow-x-auto border-b border-neutral-900 bg-black px-6">
            {dashboardTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`shrink-0 text-[11px] font-semibold tracking-widest transition-colors ${
                  tab.label === "REVIEWS"
                    ? "border-b border-white pb-[1px] text-white"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            <FadeIn>
              <header className="border-b border-neutral-900 px-6 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                  Review workspace
                </p>
                <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h1 className="text-sm font-semibold text-white">Pull request reviews</h1>
                    <p className="mt-0.5 text-[11px] text-neutral-600">
                      Repository-aware analysis for connected GitHub repositories.
                    </p>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
                    {reviews.length} record{reviews.length === 1 ? "" : "s"}
                  </p>
                </div>
              </header>

              <section className="grid grid-cols-2 divide-x divide-y divide-neutral-900 border-b border-neutral-900 lg:grid-cols-4 lg:divide-y-0">
                {[
                  { label: "Total reviews", value: reviews.length, detail: "Latest 50 review runs" },
                  { label: "Completed", value: completedReviews, detail: "Analysis finished" },
                  { label: "In progress", value: activeReviews, detail: "Queued or analyzing" },
                  { label: "High risk", value: highRiskReviews, detail: `${findings} finding${findings === 1 ? "" : "s"} detected` },
                ].map((metric) => (
                  <div key={metric.label} className="px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-600">{metric.label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white">{metric.value}</p>
                    <p className="mt-1 text-[10px] text-neutral-700">{metric.detail}</p>
                  </div>
                ))}
              </section>

              <div className="flex items-center justify-between border-b border-neutral-900 px-6 py-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                  Review activity
                </p>
                <span className="text-[10px] text-neutral-700">Newest first</span>
              </div>

              {reviews.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center px-6 py-16">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex size-10 items-center justify-center border border-neutral-800 bg-neutral-950 text-neutral-500">
                      <GitPullRequest className="size-4" />
                    </div>
                    <h2 className="mt-5 text-sm font-medium text-white">Waiting for review activity</h2>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">
                      Open or update a pull request in a connected repository. Existing open pull requests are synchronized automatically.
                    </p>
                    <Link
                      href="/repositories"
                      className="mt-5 inline-flex items-center gap-2 border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-neutral-300 transition hover:border-neutral-700 hover:text-white"
                    >
                      <SearchCode className="size-3.5" />
                      Check repositories
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_5rem] border-b border-neutral-900 bg-neutral-950/40 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-700 md:grid">
                    <span>Pull request</span>
                    <span>Status</span>
                    <span>Risk</span>
                    <span className="text-right">Findings</span>
                  </div>

                  {reviews.map((review, index) => {
                    const status = statusDetails[review.status]
                    const StatusIcon = status.icon
                    const reasons = Array.isArray(review.reasons)
                      ? review.reasons.filter((reason): reason is string => typeof reason === "string")
                      : []

                    return (
                      <FadeIn key={review.id} delay={Math.min(index * 0.035, 0.18)}>
                        <article className="border-b border-neutral-900 px-6 py-4 transition-colors hover:bg-neutral-950/40">
                          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_7rem_7rem_5rem] md:items-start">
                            <div className="min-w-0">
                              <p className="font-mono text-[10px] text-neutral-600">
                                {review.repository.fullName} / #{review.pullRequestNumber}
                              </p>
                              <a href={review.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs font-medium text-neutral-200 transition-colors hover:text-white">
                                <span className="truncate">{review.title}</span>
                                <ExternalLink className="size-3 shrink-0 text-neutral-600" />
                              </a>
                              <p className="mt-1 text-[10px] text-neutral-700">
                                {review.author ? `Opened by ${review.author} · ` : ""}
                                {review.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                              </p>
                            </div>

                            <span className={`inline-flex w-fit items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${status.className}`}>
                              <StatusIcon className={`size-3 ${review.status === "ANALYZING" ? "animate-spin" : ""}`} />
                              {status.label}
                            </span>

                            {review.riskLevel ? (
                              <span className={`inline-flex w-fit border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${riskClasses[review.riskLevel]}`}>
                                {review.riskLevel}{review.riskScore !== null ? ` / ${review.riskScore}` : ""}
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-neutral-800">—</span>
                            )}

                            <span className="font-mono text-xs text-neutral-500 md:text-right">
                              <span className="md:hidden">Findings: </span>{review.findings.length}
                            </span>
                          </div>

                          {(review.summary || reasons.length > 0 || review.error || review.findings.length > 0) && (
                            <div className="mt-4 border-l border-neutral-800 pl-4 md:ml-0">
                              {review.summary && <p className="max-w-4xl text-xs leading-5 text-neutral-400">{review.summary}</p>}

                              {reasons.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {reasons.map((reason, reasonIndex) => (
                                    <li key={reasonIndex} className="flex gap-2 text-[11px] leading-5 text-neutral-600">
                                      <AlertTriangle className="mt-1 size-3 shrink-0 text-amber-500/60" />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {review.error && <p className="mt-3 border border-red-500/20 bg-red-500/5 px-3 py-2 font-mono text-[10px] text-red-400">{review.error}</p>}

                              {review.findings.length > 0 && (
                                <details className="mt-3 border-t border-neutral-900 pt-3">
                                  <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-neutral-500 hover:text-white">
                                    Inspect {review.findings.length} finding{review.findings.length === 1 ? "" : "s"}
                                  </summary>
                                  <div className="mt-3 divide-y divide-neutral-900 border-y border-neutral-900">
                                    {review.findings.map((finding) => (
                                      <div key={finding.id} className="py-3">
                                        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-wider">
                                          <span className="text-neutral-300">{finding.severity}</span>
                                          <span className="text-neutral-700">{finding.category}</span>
                                          <code className="normal-case tracking-normal text-violet-400">{finding.filePath}{finding.line ? `:${finding.line}` : ""}</code>
                                        </div>
                                        <p className="mt-1.5 text-[11px] leading-5 text-neutral-400">{finding.message}</p>
                                        {finding.suggestion && <p className="mt-1 text-[11px] leading-5 text-neutral-600">Suggestion: {finding.suggestion}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}
                        </article>
                      </FadeIn>
                    )
                  })}
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
