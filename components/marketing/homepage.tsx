"use client"

import Link from "next/link"
import {
  ArrowRight,
  Bug,
  GitPullRequest,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { AppBackground } from "@/components/layout/app-background"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/fade-in"
import { cn } from "@/lib/utils"

interface HomepageProps {
  isAuthenticated: boolean
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Sparkles,
    title: "AI code review",
    description:
      "Get intelligent, context-aware feedback on every pull request without slowing your team down.",
  },
  {
    icon: Bug,
    title: "Bug detection",
    description:
      "Catch logic errors, edge cases, and regressions before they reach production.",
  },
  {
    icon: GitPullRequest,
    title: "PR summaries",
    description:
      "Instant summaries of changes, risks, and suggested improvements for faster reviews.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description:
      "Share review insights across your team and keep everyone aligned on code quality.",
  },
  {
    icon: Shield,
    title: "Security scanning",
    description:
      "Identify vulnerabilities, unsafe patterns, and dependency risks in your codebase.",
  },
  {
    icon: Zap,
    title: "Instant suggestions",
    description:
      "Actionable fix recommendations you can apply directly from the review panel.",
  },
]

const steps = [
  {
    step: "01",
    title: "Connect GitHub",
    description: "Link your repositories in one click. No complex setup required.",
  },
  {
    step: "02",
    title: "Open a pull request",
    description: "codeSentinel automatically analyzes new PRs as they are opened.",
  },
  {
    step: "03",
    title: "Review with AI",
    description: "Get detailed feedback, bug reports, and suggestions in seconds.",
  },
]

/* ------------------------------------------------------------------ */
/*  PR Review Preview Card (right side of hero)                        */
/* ------------------------------------------------------------------ */

function ReviewPreview() {
  const diffLines = [
    { type: "ctx", text: "  const user = await db.query(" },
    { type: "del", text: '    `SELECT * FROM users WHERE id=${req.params.id}`' },
    { type: "add", text: "    'SELECT * FROM users WHERE id=$1', [req.params.id]" },
    { type: "ctx", text: "  )" },
    { type: "ctx", text: "  return res.json(user.rows[0])" },
  ]

  const findings = [
    { severity: "critical", label: "SQL injection", file: "api/users.ts:14" },
    { severity: "warn", label: "Missing error handler", file: "api/users.ts:18" },
    { severity: "info", label: "Prefer optional chaining", file: "api/users.ts:20" },
  ]

  const severityStyle: Record<string, string> = {
    critical: "bg-red-950/60 text-red-400 border-red-900",
    warn: "bg-yellow-950/60 text-yellow-400 border-yellow-900",
    info: "bg-neutral-900 text-neutral-400 border-neutral-800",
  }

  return (
    <div className="hidden lg:flex flex-col gap-3 select-none">

      {/* ── Window chrome ── */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">

        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-neutral-800 bg-black px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-neutral-800" />
            <span className="size-2.5 rounded-full bg-neutral-800" />
            <span className="size-2.5 rounded-full bg-neutral-800" />
          </div>
          <div className="flex-1 flex items-center gap-2 ml-1">
            <GitPullRequest className="size-3.5 text-neutral-500 shrink-0" />
            <span className="text-xs text-neutral-400 font-medium">
              PR #312 · <span className="text-neutral-300">feat: user lookup endpoint</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-900 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Reviewing
          </span>
        </div>

        {/* Diff block */}
        <div className="border-b border-neutral-800">
          <div className="flex items-center gap-2 border-b border-neutral-800 bg-black/40 px-4 py-1.5">
            <span className="font-mono text-[10px] text-neutral-500">api/users.ts</span>
            <span className="ml-auto font-mono text-[10px] text-neutral-700">+1 −1</span>
          </div>
          <div className="font-mono text-[11px] leading-[1.8]">
            {diffLines.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === "del"
                    ? "bg-red-950/30 px-4 text-red-400"
                    : line.type === "add"
                      ? "bg-green-950/30 px-4 text-green-400"
                      : "px-4 text-neutral-600"
                }
              >
                <span className="mr-3 text-neutral-700 select-none">
                  {line.type === "del" ? "−" : line.type === "add" ? "+" : " "}
                </span>
                {line.text}
              </div>
            ))}
          </div>
        </div>

        {/* AI comment */}
        <div className="border-b border-neutral-800 px-4 py-3 bg-red-950/10">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[9px] font-bold text-white">
              AI
            </div>
            <div>
              <p className="text-[11px] font-semibold text-red-400 mb-0.5">Critical · SQL injection risk</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                String interpolation in SQL allows arbitrary query injection.
                Use parameterised queries with <span className="font-mono text-neutral-300">$1</span> placeholders instead.
              </p>
            </div>
          </div>
        </div>

        {/* Findings summary */}
        <div className="px-4 py-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">
            Review findings
          </p>
          {findings.map((f) => (
            <div
              key={f.label}
              className={`flex items-center gap-2.5 rounded-md border px-3 py-1.5 ${severityStyle[f.severity]}`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0">
                {f.severity}
              </span>
              <span className="text-[11px] text-neutral-300 flex-1">{f.label}</span>
              <span className="font-mono text-[10px] text-neutral-600 shrink-0">{f.file}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Below-card stat strip ── */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-neutral-500" />
          <span className="text-[11px] text-neutral-500">Powered by Gemini 2.0 Flash + RAG</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-600">3 issues</span>
          <span className="font-mono text-[11px] text-neutral-700">·</span>
          <span className="text-[11px] text-neutral-600">~18s</span>
        </div>
      </div>

    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Homepage component                                             */
/* ------------------------------------------------------------------ */

export function Homepage({ isAuthenticated }: HomepageProps) {
  const ctaHref = isAuthenticated ? "/dashboard" : "/login"
  const ctaLabel = isAuthenticated ? "Go to dashboard" : "Get started"

  return (
    <AppBackground>
      <MarketingHeader isAuthenticated={isAuthenticated} />

      <main className="bg-black text-white">
        {/* ── Hero (split layout) ───────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:px-10 md:pt-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

            {/* Left — hero copy */}
            <FadeIn>
              <div className="space-y-6">
                {/* Announcement badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-neutral-400">
                    Now with RAG-powered codebase context
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                  Automate code reviews.
                  <br />
                  <span className="text-neutral-500">Ship with confidence.</span>
                </h1>

                <p className="max-w-md text-base leading-relaxed text-neutral-400">
                  codeSentinel automatically reviews pull requests, detects bugs, and suggests
                  actionable fixes directly inside GitHub — before bugs hit production.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    render={<Link href={ctaHref} />}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    {ctaLabel}
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button
                    render={<Link href="/docs" />}
                    variant="outline"
                    size="lg"
                    className="border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  >
                    Read the docs
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Right — PR review preview */}
            <FadeIn delay={0.1}>
              <ReviewPreview />
            </FadeIn>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────── */}
        <section id="features" className="border-t border-neutral-900 mx-auto max-w-6xl px-6 py-28 md:px-10">
          <FadeIn>
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                Automate pull request workflow.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                A minimal setup for automated analysis, code reviews, and detailed debugging summaries.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={0.05 * i}>
                <div className="space-y-4">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-neutral-900">
          <div className="mx-auto max-w-6xl px-6 py-28 md:px-10">
            <FadeIn>
              <div className="max-w-2xl mb-16">
                <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                  Up and running in seconds.
                </h2>
              </div>
            </FadeIn>

            <div className="grid gap-12 md:grid-cols-3">
              {steps.map((step, i) => (
                <FadeIn key={step.step} delay={0.08 * i}>
                  <div className="space-y-4">
                    <span className="font-mono text-sm font-bold text-neutral-500">
                      {step.step}
                    </span>
                    <h3 className="text-lg font-semibold text-white tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="border-t border-neutral-900">
          <div className="mx-auto max-w-6xl px-6 py-28 md:px-10 flex flex-col items-center text-center">
            <FadeIn>
              <div className="space-y-8 max-w-2xl">
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
                  Ship high-quality code today.
                </h2>
                <p className="text-base leading-relaxed text-neutral-400">
                  Integrate codeSentinel in seconds to start catching bugs early and automating
                  your pull request reviews.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button
                    render={<Link href={ctaHref} />}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    {ctaLabel}
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button
                    render={<Link href="/docs" />}
                    variant="outline"
                    size="lg"
                    className="border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  >
                    Documentation
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-900 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} codeSentinel</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/docs" className="transition-colors hover:text-white">
              Docs
            </Link>
            <Link href="/login" className="transition-colors hover:text-white">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </AppBackground>
  )
}
