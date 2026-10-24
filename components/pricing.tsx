"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, ChevronDown, FolderGit2, GitPullRequest, Info, Minus, ShieldCheck } from "lucide-react"

const plans = [
  {
    name: "Free", monthly: 0, yearly: 0,
    description: "For personal projects and occasional reviews.",
    reviews: "20", repositories: "1 repository",
    features: ["Automatic pull-request reviews", "Risk scores and actionable findings", "Review comments on GitHub", "Public and private repositories", "30-day review history", "Standard processing queue"],
  },
  {
    name: "Pro", monthly: 999, yearly: 9990,
    description: "For active developers reviewing code every day.",
    reviews: "200", repositories: "10 repositories",
    features: ["Everything in Free", "6-month review history", "Priority processing queue", "Per-repository review instructions", "Detailed usage breakdown", "More room for active projects"],
  },
  {
    name: "Max", monthly: 2999, yearly: 29990,
    description: "For high-volume reviews across multiple projects.",
    reviews: "1,000", repositories: "30 repositories",
    features: ["Everything in Pro", "12-month review history", "Highest-priority processing queue", "Reusable review instructions", "Usage insights by repository", "Capacity for your busiest months"],
  },
] as const

const comparison = [
  { label: "Connected repositories", values: ["1", "10", "30"] },
  { label: "Review runs / month", values: ["20", "200", "1,000"] },
  { label: "Public & private repositories", values: [true, true, true] },
  { label: "Automatic GitHub PR comments", values: [true, true, true] },
  { label: "Risk scores & findings", values: [true, true, true] },
  { label: "Review history", values: ["30 days", "6 months", "12 months"] },
  { label: "Processing queue", values: ["Standard", "Priority", "Highest priority"] },
  { label: "Custom review instructions", values: [false, "Per repository", "Reusable across repos"] },
  { label: "Usage insights", values: ["Basic counter", "Detailed usage", "By repository"] },
] as const

const faqs = [
  { question: "Can I subscribe to a paid plan yet?", answer: "Pro and Max are coming soon. This page previews the proposed prices and plan limits; paid subscriptions and checkout are not available yet. You can get started with the current app through GitHub." },
  { question: "What counts as a review run?", answer: "Under the proposed plans, one analysis of a pull-request version counts as one run. Pushing new changes can trigger another run. Duplicate webhook deliveries and retries caused by infrastructure failures would not use additional runs." },
  { question: "Do higher plans get better review quality?", answer: "All plans are designed to use the same core review quality, risk scores, and findings. Paid plans add capacity, longer history, queue priority, and customization." },
  { question: "What happens when I reach my monthly limit?", answer: "The planned behavior is to pause new reviews until your allowance resets or you upgrade. There will be no automatic overage charges. Monthly allowances would reset each month, including on yearly plans." },
  { question: "Are repository chat and whole-repo context included?", answer: "The current release reviews pull-request diffs. Repository indexing and codebase chat are paused and are not included in these advertised plans. Review coverage is subject to the supported diff-size limits documented in the product docs." },
  { question: "How does yearly pricing work?", answer: "The proposed yearly prices are ₹9,990 for Pro and ₹29,990 for Max, paid once per year. That is the cost of ten monthly payments for twelve months of access. All prices shown are in Indian rupees; any applicable taxes will be shown when checkout becomes available." },
]

function rupees(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="flex min-w-0 flex-col text-white">
      <nav aria-label="Workspace navigation" className="flex h-10 shrink-0 items-center gap-6 overflow-x-auto border-b border-neutral-900 px-6">
        {[
          { label: "Overview", href: "/dashboard" },
          { label: "Reviews", href: "/reviews" },
          { label: "Repositories", href: "/repositories" },
          { label: "Plans & Pricing", href: "/pricing" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} aria-current={tab.href === "/pricing" ? "page" : undefined} className={`shrink-0 text-[11px] font-semibold uppercase tracking-widest transition-colors ${tab.href === "/pricing" ? "border-b border-white pb-px text-white" : "text-neutral-600 hover:text-neutral-400"}`}>
            {tab.label}
          </Link>
        ))}
      </nav>

      <header className="border-b border-neutral-900 px-6 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">Workspace / Plans</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold leading-snug">Plans & Pricing</h1>
            <p className="mt-0.5 text-[11px] text-neutral-500">Choose the review capacity that fits your workflow.</p>
          </div>
          <span className="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 font-mono text-[10px] text-neutral-400">INR ₹</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-6 sm:px-6 lg:py-8">
        <section aria-label="Plan availability" className="flex items-start gap-3 rounded-lg border border-neutral-900 bg-neutral-950/40 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-neutral-300">Paid plans are coming soon</p>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">Preview proposed prices and allowances. Subscriptions and plan limits are not active yet.</p>
          </div>
        </section>

        <section aria-label="Available plans">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Find your plan</h2>
              <p className="mt-1 text-[11px] text-neutral-500">Same core review quality. More room as you grow.</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-900 bg-neutral-950 p-1" role="group" aria-label="Billing period">
              {[false, true].map((annual) => (
                <button key={String(annual)} type="button" aria-pressed={yearly === annual} onClick={() => setYearly(annual)} className={`min-h-9 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 ${yearly === annual ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
                  {annual ? "Yearly" : "Monthly"}
                  {annual && <span className="ml-2 text-[10px] text-emerald-400">2 months free</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const featured = plan.name === "Pro"
              const free = plan.name === "Free"

              return (
                <article key={plan.name} className={`flex flex-col rounded-lg border bg-neutral-950/40 ${featured ? "border-neutral-600" : "border-neutral-900"}`}>
                  <div className="flex min-h-12 items-center justify-between gap-2 border-b border-neutral-900 px-5 py-3">
                    <h3 className="text-base font-semibold leading-snug">{plan.name}</h3>
                    {featured ? <span className="rounded border border-neutral-700 bg-neutral-800/60 px-2 py-0.5 text-[10px] text-neutral-300">Recommended</span> : <span className="text-[10px] text-neutral-500">{free ? "Get started" : "More capacity"}</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="min-h-12 text-xs leading-6 text-neutral-500">{plan.description}</p>
                    <div className="mt-5" aria-live="polite" aria-atomic="true">
                      <p className="flex flex-wrap items-baseline gap-1.5"><span className="text-2xl font-semibold leading-tight tracking-[-0.03em] tabular-nums">{rupees(yearly ? plan.yearly : plan.monthly)}</span><span className="text-xs text-neutral-500">{free ? "/ forever" : yearly ? "/ year" : "/ month"}</span></p>
                      <p className="mt-2 min-h-10 text-[11px] leading-5 text-neutral-500">{free ? "No credit card required." : yearly ? `${rupees(plan.monthly * 12 - plan.yearly)} saved per year. Billed yearly.` : "Billed monthly when plans launch."}</p>
                    </div>

                    <div className="my-5 space-y-3 border-y border-neutral-900 py-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-300"><GitPullRequest className="size-3.5 shrink-0 text-neutral-500" aria-hidden="true" /><span><span className="font-semibold text-white">{plan.reviews}</span> review runs / month</span></div>
                      <div className="flex items-center gap-2 text-xs text-neutral-300"><FolderGit2 className="size-3.5 shrink-0 text-neutral-500" aria-hidden="true" />{plan.repositories}</div>
                    </div>

                    {free ? (
                      <Link href="/repositories" className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white">Connect a repository <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
                    ) : (
                      <button type="button" disabled className={`min-h-10 cursor-not-allowed rounded-md border px-3 text-xs font-medium ${featured ? "border-neutral-700 bg-neutral-200 text-neutral-700" : "border-neutral-800 bg-neutral-900/50 text-neutral-500"}`}>{plan.name} — Coming soon</button>
                    )}

                    <p className="mb-4 mt-6 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">{free ? "Included features" : "Planned benefits"}</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs leading-6 text-neutral-400"><Check className="mt-1.5 size-3 shrink-0 text-neutral-500" aria-hidden="true" />{feature}</li>)}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
          <p className="mt-4 flex items-center gap-2 text-[10px] text-neutral-500"><ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />All plans include public and private repositories. No automatic overage charges are planned.</p>
        </section>

        <section aria-labelledby="comparison-heading" className="overflow-hidden rounded-lg border border-neutral-900">
          <div className="border-b border-neutral-900 px-5 py-4">
            <h2 id="comparison-heading" className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Plan comparison</h2>
            <p className="mt-1 text-[10px] text-neutral-500">Proposed allowances and benefits by plan.</p>
          </div>
          <p className="px-5 pt-3 text-[10px] text-neutral-500 md:hidden">Scroll horizontally to see all plans →</p>
          <div className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-neutral-400" tabIndex={0} role="region" aria-label="Scrollable plan comparison">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs leading-6">
              <caption className="sr-only">Proposed Free, Pro, and Max plan features</caption>
              <thead className="bg-neutral-950/60"><tr className="border-b border-neutral-900"><th scope="col" className="w-[34%] px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Feature</th>{plans.map((plan) => <th key={plan.name} scope="col" className={`w-[22%] px-4 py-3 font-medium ${plan.name === "Pro" ? "bg-neutral-900/30 text-white" : "text-neutral-400"}`}>{plan.name}</th>)}</tr></thead>
              <tbody>{comparison.map((row) => <tr key={row.label} className="border-b border-neutral-900 last:border-0"><th scope="row" className="px-5 py-3.5 font-normal text-neutral-400">{row.label}</th>{row.values.map((value, index) => <td key={plans[index].name} className={`px-4 py-3.5 text-neutral-300 ${index === 1 ? "bg-neutral-900/20" : ""}`}>{typeof value === "boolean" ? value ? <><Check className="size-3.5 text-neutral-300" aria-hidden="true" /><span className="sr-only">Included</span></> : <><Minus className="size-3.5 text-neutral-600" aria-hidden="true" /><span className="sr-only">Not included</span></> : value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="overflow-hidden rounded-lg border border-neutral-900">
          <div className="border-b border-neutral-900 px-5 py-4"><h2 id="faq-heading" className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Frequently asked questions</h2></div>
          <div className="divide-y divide-neutral-900">
            {faqs.map((faq) => <details key={faq.question} className="group px-5"><summary className="flex cursor-pointer list-none items-center gap-4 py-4 text-xs leading-6 text-neutral-300 hover:text-white focus-visible:outline-2 focus-visible:outline-neutral-400 [&::-webkit-details-marker]:hidden"><span className="flex-1">{faq.question}</span><ChevronDown className="size-3.5 shrink-0 text-neutral-500 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary><p className="max-w-3xl pb-5 pr-5 text-xs leading-6 text-neutral-500">{faq.answer}</p></details>)}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900 pt-4 text-[11px] leading-5 text-neutral-500"><p>Prices in INR. Applicable taxes will be shown when checkout launches.</p><Link href="/docs" className="flex items-center gap-1.5 text-neutral-400 hover:text-white">Product documentation <ArrowUpRight className="size-3" aria-hidden="true" /></Link></div>
      </div>
    </div>
  )
}

