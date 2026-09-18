import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { getReviews } from "@/module/reviews"
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  ExternalLink,
  GitPullRequest,
  Loader2,
} from "lucide-react"

const statusDetails = {
  QUEUED: { label: "Queued", icon: Loader2, className: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  ANALYZING: { label: "Analyzing", icon: Loader2, className: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, className: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  FAILED: { label: "Failed", icon: CircleX, className: "text-red-400 border-red-500/20 bg-red-500/10" },
} as const

const riskClasses = {
  LOW: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  MEDIUM: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  HIGH: "text-red-400 border-red-500/20 bg-red-500/10",
} as const

export default async function ReviewsPage() {
  const session = await requireAuth()
  const reviews = await getReviews()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 md:px-10 md:py-14">
          <FadeIn>
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Pull request reviews
              </h1>
              <p className="text-sm text-neutral-400">
                Repository-aware analysis triggered by GitHub pull request events.
              </p>
            </header>
          </FadeIn>

          {reviews.length === 0 ? (
            <FadeIn delay={0.08}>
              <div className="rounded-lg border border-neutral-900 bg-neutral-950/30 px-6 py-16">
                <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
                    <GitPullRequest className="size-5" />
                  </div>
                  <h3 className="mt-6 text-sm font-medium text-white">No reviews yet</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    Connect and index a repository, then open or update a pull request. Its review will appear here.
                  </p>
                </div>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => {
                const status = statusDetails[review.status]
                const StatusIcon = status.icon
                const reasons = Array.isArray(review.reasons)
                  ? review.reasons.filter((reason): reason is string => typeof reason === "string")
                  : []

                return (
                  <FadeIn key={review.id} delay={Math.min(index * 0.04, 0.2)}>
                    <article className="rounded-xl border border-neutral-900 bg-neutral-950/50 p-5">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-600">
                            {review.repository.fullName} · PR #{review.pullRequestNumber}
                          </p>
                          <a href={review.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-blue-400">
                            <span className="truncate">{review.title}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                          <p className="mt-1 text-[11px] text-neutral-600">
                            {review.author ? `Opened by ${review.author} · ` : ""}
                            {review.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${status.className}`}>
                            <StatusIcon className={`size-3 ${review.status === "ANALYZING" ? "animate-spin" : ""}`} />
                            {status.label}
                          </span>
                          {review.riskLevel && (
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${riskClasses[review.riskLevel]}`}>
                              {review.riskLevel} RISK{review.riskScore !== null ? ` · ${review.riskScore}` : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {review.summary && <p className="mt-4 text-sm leading-6 text-neutral-300">{review.summary}</p>}

                      {reasons.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex gap-2 text-xs leading-5 text-neutral-500">
                              <AlertTriangle className="mt-1 size-3 shrink-0 text-amber-500/70" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}

                      {review.error && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{review.error}</p>}

                      {review.findings.length > 0 && (
                        <details className="mt-4 border-t border-neutral-900 pt-4">
                          <summary className="cursor-pointer text-xs font-medium text-neutral-400 hover:text-white">
                            {review.findings.length} finding{review.findings.length === 1 ? "" : "s"}
                          </summary>
                          <div className="mt-3 space-y-3">
                            {review.findings.map((finding) => (
                              <div key={finding.id} className="rounded-lg border border-neutral-900 bg-black p-3">
                                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                  <span className="font-semibold text-neutral-300">{finding.severity}</span>
                                  <span className="text-neutral-700">{finding.category}</span>
                                  <code className="text-violet-400">{finding.filePath}{finding.line ? `:${finding.line}` : ""}</code>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-neutral-400">{finding.message}</p>
                                {finding.suggestion && <p className="mt-2 text-xs leading-5 text-neutral-600">Suggestion: {finding.suggestion}</p>}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </article>
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </DashboardShell>
    </AppBackground>
  )
}
