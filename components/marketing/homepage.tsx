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

interface HomepageProps {
  isAuthenticated: boolean
}

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

const stats = [
  { value: "50%", label: "Faster reviews" },
  { value: "10k+", label: "PRs analyzed" },
  { value: "99.9%", label: "Uptime" },
  { value: "<30s", label: "Avg. review time" },
]

export function Homepage({ isAuthenticated }: HomepageProps) {
  const ctaHref = isAuthenticated ? "/dashboard" : "/login"
  const ctaLabel = isAuthenticated ? "Go to dashboard" : "Get started"

  return (
    <AppBackground>
      <MarketingHeader isAuthenticated={isAuthenticated} />

      <main className="bg-black text-white">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-32 pt-24 md:px-10 md:pt-40">
          <FadeIn>
            <div className="max-w-3xl space-y-8">
              <h1 className="text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Automate code reviews.
                <br />
                Ship with confidence.
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-neutral-400 sm:text-lg">
                codeSentinel automatically reviews pull requests, detects bugs, and suggests actionable fixes directly inside GitHub before bugs hit production.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  render={<Link href={ctaHref} />}
                  size="lg"
                  className="gap-2 bg-white text-black hover:bg-neutral-200 transition-colors"
                >
                  {ctaLabel}
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button
                  render={<a href="#features" />}
                  variant="outline"
                  size="lg"
                  className="border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white"
                >
                  Learn more
                </Button>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Stats */}
        <section className="border-y border-neutral-900">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 px-6 md:px-10">
            {stats.map((stat, i) => {
              const borderClasses = `py-12 text-center ${
                i < 3 ? "border-r border-neutral-900" : ""
              }`
              return (
                <div key={stat.label} className={borderClasses}>
                  <p className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-5xl px-6 py-32 md:px-10">
          <FadeIn>
            <div className="max-w-2xl mb-20">
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                Automate pull request workflow.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                A minimal setup for automated analysis, code reviews, and detailed debugging summaries.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* How it works */}
        <section id="how-it-works" className="border-t border-neutral-900">
          <div className="mx-auto max-w-5xl px-6 py-32 md:px-10">
            <FadeIn>
              <div className="max-w-2xl mb-20">
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

        {/* CTA */}
        <section className="border-t border-neutral-900">
          <div className="mx-auto max-w-5xl px-6 py-32 md:px-10 flex flex-col items-center text-center">
            <FadeIn>
              <div className="space-y-8 max-w-2xl">
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
                  Ship high-quality code today.
                </h2>
                <p className="text-base leading-relaxed text-neutral-400">
                  Integrate codeSentinel in seconds to start catching bugs early and automating your pull request reviews.
                </p>
                <div className="pt-4 flex justify-center">
                  <Button
                    render={<Link href={ctaHref} />}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    {ctaLabel}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-900 bg-black">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} codeSentinel</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Privacy
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
