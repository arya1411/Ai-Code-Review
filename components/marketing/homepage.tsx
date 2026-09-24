"use client"

import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Bug,
  GitPullRequest,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle,
  Database,
  Activity,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { AppBackground } from "@/components/layout/app-background"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/fade-in"

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
      "Context-aware feedback on every pull request. Understands your codebase, not just the diff.",
    badge: "Core",
    accent: "from-violet-500/10 to-transparent",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/20",
  },
  {
    icon: Database,
    title: "RAG-powered context",
    description:
      "Reviews grounded in indexed repository context, including relevant files outside the pull request diff.",
    badge: "Differentiator",
    accent: "from-blue-500/10 to-transparent",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    icon: MessageSquare,
    title: "Repo chatbot",
    description:
      "Ask questions about your codebase and inspect the repository files used to ground each answer.",
    badge: "New",
    accent: "from-emerald-500/10 to-transparent",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: TrendingUp,
    title: "PR risk scoring",
    description:
      "Every push gets a colored badge — Low, Medium, or High — with 2–3 plain-language reasons attached.",
    badge: "New",
    accent: "from-amber-500/10 to-transparent",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Bug,
    title: "Bug & security detection",
    description:
      "Identifies logic errors, edge cases, vulnerabilities, and unsafe patterns before they hit production.",
    badge: "Core",
    accent: "from-red-500/10 to-transparent",
    iconColor: "text-red-400",
    borderColor: "border-red-500/20",
  },
  {
    icon: Activity,
    title: "Repo health dashboard",
    description:
      "Contribution graphs, monthly activity charts, and commit history aggregated across all your repos.",
    badge: "Core",
    accent: "from-pink-500/10 to-transparent",
    iconColor: "text-pink-400",
    borderColor: "border-pink-500/20",
  },
]

const steps = [
  {
    step: "01",
    title: "Connect GitHub",
    description: "Link your repositories in one click. No complex setup or YAML configs required.",
    icon: GitPullRequest,
  },
  {
    step: "02",
    title: "Open a pull request",
    description: "codeSentinel automatically triggers analysis on every new PR via GitHub webhooks.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Review with AI",
    description: "Inspect risk scores, source-grounded findings, and suggested patches in the dashboard.",
    icon: Bot,
  },
]

const differentiators = [
  {
    label: "Repository awareness",
    description:
      "Retrieves relevant indexed files outside the pull request so reviews are not limited to the diff alone.",
  },
  {
    label: "Reasoning transparency",
    description:
      "Chat answers identify the repository files used as context, while review findings include concrete file and line details when available.",
  },
  {
    label: "Convention drift detection",
    description:
      "Flags when a PR doesn't follow patterns established elsewhere in the codebase — duplicate logic, stale docs, test gaps.",
  },
]

const stats = [
  { value: "1", label: "AI provider", sub: "Google Gemini" },
  { value: "RAG", label: "powered context", sub: "PostgreSQL + pgvector" },
  { value: "150", label: "files indexed", sub: "Refreshed on default-branch pushes" },
]

/* ------------------------------------------------------------------ */
/*  PR Review Preview Card                                              */
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
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl ring-1 ring-white/5">

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

        {/* Risk badge row */}
        <div className="flex items-center gap-2 border-b border-neutral-800 bg-red-950/10 px-4 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">Risk</span>
          <span className="flex items-center gap-1.5 rounded-full border border-red-900 bg-red-950/50 px-2.5 py-0.5 text-[10px] font-semibold text-red-400">
            HIGH · 87
          </span>
          <span className="text-[10px] text-neutral-600 ml-1">touches auth · no tests · large diff</span>
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
                String interpolation allows arbitrary query injection. Use parameterised queries with{" "}
                <span className="font-mono text-neutral-300">$1</span> placeholders.
                Found similar safe pattern in <span className="font-mono text-violet-400">db/queries.ts:42</span>.
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
          <span className="text-[11px] text-neutral-500">Powered by Gemini Flash + RAG</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-600">Example review output</span>
        </div>
      </div>

    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Repo Chat Preview                                                   */
/* ------------------------------------------------------------------ */

function ChatPreview() {
  const messages = [
    {
      role: "user",
      text: "What are the riskiest files in this repo?",
    },
    {
      role: "ai",
      text: "Based on churn and bug-flag frequency, the top 3 are:",
      chips: ["api/users.ts", "auth/session.ts", "db/queries.ts"],
    },
    {
      role: "user",
      text: "Why is auth/session.ts risky?",
    },
    {
      role: "ai",
      text: "It's touched in 14 of the last 20 PRs, has 3 open HIGH-risk findings, and no corresponding test file was updated.",
      chips: ["PR #289", "PR #301", "PR #310"],
    },
  ]

  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl ring-1 ring-white/5">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-black px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-neutral-800" />
          <span className="size-2.5 rounded-full bg-neutral-800" />
          <span className="size-2.5 rounded-full bg-neutral-800" />
        </div>
        <div className="flex-1 flex items-center gap-2 ml-1">
          <MessageSquare className="size-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-neutral-400 font-medium">
            Chat with <span className="text-neutral-300">my-api-service</span>
          </span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-900 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Indexed
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 p-4 text-[11px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[8px] font-bold text-white">
                  AI
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-300 leading-relaxed">
                    {msg.text}
                  </div>
                  {msg.chips && (
                    <div className="flex flex-wrap gap-1">
                      {msg.chips.map((chip) => (
                        <span key={chip} className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono text-violet-400">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="rounded-lg bg-neutral-800 px-3 py-2 text-neutral-200 leading-relaxed max-w-[80%]">
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="border-t border-neutral-800 px-3 py-2.5 flex items-center gap-2">
        <div className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[11px] text-neutral-600">
          Ask anything about your repo…
        </div>
        <button className="flex size-7 items-center justify-center rounded-md bg-white text-black">
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Homepage component                                             */
/* ------------------------------------------------------------------ */

export function Homepage({ isAuthenticated }: HomepageProps) {
  const ctaHref = isAuthenticated ? "/dashboard" : "/login"
  const ctaLabel = isAuthenticated ? "Go to dashboard" : "Get started free"

  return (
    <AppBackground>
      <MarketingHeader isAuthenticated={isAuthenticated} />

      <main className="bg-black text-white">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-8 md:px-10 md:pt-14 overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-violet-900/10 blur-[120px]" />

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 relative">

            {/* Left — hero copy */}
            <FadeIn>
              <div className="space-y-7">
                {/* Label pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Repo-aware · Not just diff-aware
                </div>

                <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                  AI code review
                  <br />
                  <span className="text-neutral-500">that reads beyond</span>
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                    the diff.
                  </span>
                </h1>

                <p className="max-w-md text-base leading-relaxed text-neutral-400">
                  codeSentinel analyzes pull requests with relevant indexed repository context to uncover
                  breaking changes, convention drift, and security issues beyond the changed files.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    render={<Link href={ctaHref} />}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-neutral-200 transition-colors font-semibold"
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

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                  {["GitHub webhooks", "PostgreSQL RAG", "Google Gemini"].map((item) => (
                    <span key={item} className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <CheckCircle className="size-3.5 text-emerald-600" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Right — PR review preview */}
            <FadeIn delay={0.1}>
              <ReviewPreview />
            </FadeIn>
          </div>
        </section>

        {/* ── Stats strip ─────────────────────────────────────── */}
        <section className="border-y border-neutral-900">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <div className="grid grid-cols-3 divide-x divide-neutral-900">
              {stats.map((s) => (
                <div key={s.label} className="px-6 py-8 text-center">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-white">{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-400">{s.label}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-700">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-28 md:px-10">
          <FadeIn>
            <div className="max-w-2xl mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-500 mb-5">
                <Sparkles className="size-3 text-violet-400" />
                Feature set
              </div>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                Everything you need to ship with confidence.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                From automated PR analysis to repository chat — all grounded in your indexed source code.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={0.05 * i}>
                <div className={`relative rounded-xl border ${feature.borderColor} bg-gradient-to-b ${feature.accent} p-5 space-y-4 h-full`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex size-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 ${feature.iconColor}`}>
                      <feature.icon className="size-4" />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${feature.iconColor} opacity-70`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Repo Chat Highlight ──────────────────────────────── */}
        <section id="chat" className="border-t border-neutral-900">
          <div className="mx-auto max-w-6xl px-6 py-28 md:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

              {/* Left — chat preview */}
              <FadeIn>
                <ChatPreview />
              </FadeIn>

              {/* Right — copy */}
              <FadeIn delay={0.1}>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    New feature
                  </div>
                  <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                    Chat with your
                    <br />
                    <span className="text-neutral-500">indexed codebase.</span>
                  </h2>
                  <p className="text-base leading-relaxed text-neutral-400">
                    The repo chatbot retrieves relevant source chunks through PostgreSQL pgvector.
                    Every answer lists the repository files used as context so you can inspect
                    what grounded the response.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Asks like a senior engineer, cites like a search engine",
                      "Re-indexed after default-branch pushes",
                      "Suggested prompts for onboarding: riskiest files, schema, architecture",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-400">
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

            </div>
          </div>
        </section>

        {/* ── Why codeSentinel ────────────────────────────────── */}
        <section className="border-t border-neutral-900 bg-neutral-950/30">
          <div className="mx-auto max-w-6xl px-6 py-24 md:px-10">
            <FadeIn>
              <div className="max-w-2xl mb-14">
                <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                  What makes it different.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-neutral-400">
                  codeSentinel supplements pull request diffs with relevant indexed repository context.
                </p>
              </div>
            </FadeIn>

            <div className="grid gap-6 md:grid-cols-3">
              {differentiators.map((d, i) => (
                <FadeIn key={d.label} delay={0.07 * i}>
                  <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-3 h-full">
                    <div className="flex size-8 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 font-mono text-xs font-bold text-neutral-400">
                      0{i + 1}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{d.label}</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">{d.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-neutral-900">
          <div className="mx-auto max-w-6xl px-6 py-28 md:px-10">
            <FadeIn>
              <div className="max-w-2xl mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-500 mb-5">
                  <Zap className="size-3 text-amber-400" />
                  Setup in minutes
                </div>
                <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                  A clear three-step workflow.
                </h2>
              </div>
            </FadeIn>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <FadeIn key={step.step} delay={0.08 * i}>
                  <div className="relative space-y-5">
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-5 left-[calc(100%+1rem)] right-[-1rem] h-px bg-gradient-to-r from-neutral-800 to-transparent" />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400">
                        <step.icon className="size-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-neutral-600">{step.step}</span>
                    </div>
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
          <div className="relative mx-auto max-w-6xl px-6 py-28 md:px-10 flex flex-col items-center text-center overflow-hidden">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-violet-900/10 blur-[80px]" />
            <FadeIn>
              <div className="relative space-y-8 max-w-2xl">
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
                  Ship high-quality code.
                  <br />
                  <span className="text-neutral-500">Starting today.</span>
                </h2>
                <p className="text-base leading-relaxed text-neutral-400">
                  Connect codeSentinel and start catching bugs, security issues, and convention
                  drift before they reach production.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Button
                    render={<Link href={ctaHref} />}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-neutral-200 transition-colors font-semibold"
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
            <Link href="/docs" className="transition-colors hover:text-white">Docs</Link>
            <Link href="#features" className="transition-colors hover:text-white">Features</Link>
            <Link href="#chat" className="transition-colors hover:text-white">Chat</Link>
            <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </AppBackground>
  )
}
