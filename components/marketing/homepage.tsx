"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, ChevronRight, CircleDot, MessageSquareText, ScanLine, ScanSearch, ShieldCheck, Terminal } from "lucide-react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { useHomepageMotion } from "@/components/marketing/use-homepage-motion"

interface HomepageProps { isAuthenticated: boolean }

const partners = ["VERCEL", "GITHUB", "LINEAR", "SUPABASE", "SENTRY", "GITLAB"]
const reviewModes = {
  security: { label: "SECURITY", file: "src/auth/session.ts", line: "42", title: "Session token accepted without rotation", detail: "A stale refresh token can be replayed after the user's password changes.", risk: "HIGH RISK" },
  logic: { label: "LOGIC", file: "src/billing/invoice.ts", line: "118", title: "Retry path can duplicate a charge", detail: "The idempotency key is generated inside the retry loop instead of per request.", risk: "MEDIUM RISK" },
  quality: { label: "QUALITY", file: "src/api/projects.ts", line: "76", title: "Repository convention drift", detail: "This route bypasses the shared validator used by adjacent project endpoints.", risk: "CONTEXT GAP" },
} as const
type ReviewMode = keyof typeof reviewModes

const features = [
  { no: "01", icon: ScanSearch, title: "Whole-repo context", body: "Reviews retrieve the files that matter outside the diff, so feedback understands the system—not just the changed lines." },
  { no: "02", icon: ShieldCheck, title: "Risk before merge", body: "Every pull request gets a clear risk level with concise reasons covering security, logic, tests, and convention drift." },
  { no: "03", icon: MessageSquareText, title: "Ask the codebase", body: "Get direct answers grounded in indexed source. Every response cites the files used to build it." },
]

function CornerMarks() {
  return <><span className="corner-mark corner-mark-tl" /><span className="corner-mark corner-mark-tr" /><span className="corner-mark corner-mark-bl" /><span className="corner-mark corner-mark-br" /></>
}

function ReviewPanel() {
  const [mode, setMode] = useState<ReviewMode>("security")
  const active = reviewModes[mode]
  return (
    <div className="review-console relative" data-console>
      <CornerMarks />
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-white/45"><span className="size-1.5 rounded-full bg-[#d7c2a4] shadow-[0_0_10px_#d7c2a4]" />LIVE REVIEW / PR #312</div>
        <span className="font-mono text-[10px] text-white/30">00:07.84</span>
      </div>
      <div className="grid grid-cols-3 border-b border-white/10">
        {(Object.keys(reviewModes) as ReviewMode[]).map((key) => <button key={key} onClick={() => setMode(key)} className={`console-tab ${mode === key ? "is-active" : ""}`}>{reviewModes[key].label}</button>)}
      </div>
      <div className="relative min-h-[330px] overflow-hidden p-5 sm:p-7">
        <div className="console-scan" />
        <div className="mb-7 flex items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] tracking-[0.12em] text-[#d7c2a4]">{active.file}:{active.line}</p><h3 className="mt-3 max-w-sm text-xl font-medium leading-tight text-white sm:text-2xl">{active.title}</h3></div>
          <span className="shrink-0 border border-[#d7c2a4]/40 bg-[#d7c2a4]/10 px-2 py-1 font-mono text-[9px] text-[#eadbc5]">{active.risk}</span>
        </div>
        <div className="code-block font-mono text-[11px] leading-7 sm:text-xs">
          <div><span className="text-white/20">38</span><span className="ml-5 text-[#8f99a8]">const session = await verifyToken(token)</span></div>
          <div><span className="text-white/20">39</span><span className="ml-5 text-[#8f99a8]">if (!session) throw unauthorized()</span></div>
          <div className="-mx-3 border-l border-[#ff5577] bg-[#ff5577]/8 px-3"><span className="text-[#ff5577]/60">42</span><span className="ml-5 text-[#ff7893]">return createSession(session.userId)</span></div>
          <div><span className="text-white/20">43</span><span className="ml-5 text-[#8f99a8]">{"// refresh token remains valid"}</span></div>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5">
          <p className="text-sm leading-6 text-white/55">{active.detail}</p>
          <div className="mt-4 flex items-center justify-between font-mono text-[10px]"><span className="flex items-center gap-2 text-[#45dca2]"><Check className="size-3" /> PATCH READY</span><button className="text-white/55 transition-colors hover:text-white">VIEW FIX <ArrowUpRight className="ml-1 inline size-3" /></button></div>
        </div>
      </div>
    </div>
  )
}

export function Homepage({ isAuthenticated }: HomepageProps) {
  const root = useRef<HTMLDivElement>(null)
  useHomepageMotion(root)
  const ctaHref = isAuthenticated ? "/dashboard" : "/login"
  const ctaLabel = isAuthenticated ? "OPEN DASHBOARD" : "START REVIEWING"
  return (
    <div className="marketing-shell min-h-screen bg-[#101010] text-white">
      <MarketingHeader isAuthenticated={isAuthenticated} />
      <main ref={root}>
        <section className="hero-grid relative overflow-hidden border-b border-white/10">
          <div className="signal-field" aria-hidden="true"><div className="signal-glow" /><div className="signal-dots" /><div className="signal-orbit signal-orbit-a" /><div className="signal-orbit signal-orbit-b" /></div>
          <div className="site-frame relative grid min-h-[710px] items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
            <div data-hero className="relative z-10 max-w-[660px]">
              <h1 className="reveal-up text-balance text-[clamp(3.2rem,6.2vw,6.4rem)] font-medium leading-[.91] tracking-[-0.065em]">Review code with<span className="block text-[#d7c2a4]">the full picture.</span></h1>
              <p className="reveal-up mt-8 max-w-[570px] text-base leading-7 text-white/52 sm:text-lg">codeSentinel understands your repository, catches what the diff misses, and turns every pull request into a clearer decision.</p>
              <div className="reveal-up mt-10 flex flex-wrap items-center gap-3"><Link href={ctaHref} className="blue-button group">{ctaLabel}<ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></Link><Link href="/docs" className="outline-button">EXPLORE DOCS <ArrowUpRight className="size-3.5" /></Link></div>
              <div className="reveal-up mt-10 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[10px] text-white/35"><span><Check className="mr-1.5 inline size-3 text-[#45dca2]" /> 2 MINUTE SETUP</span><span><Check className="mr-1.5 inline size-3 text-[#45dca2]" /> GITHUB NATIVE</span><span><Check className="mr-1.5 inline size-3 text-[#45dca2]" /> NO YAML</span></div>
            </div>
            <div className="reveal-up relative z-10 lg:translate-x-4"><ReviewPanel /></div>
          </div>
        </section>

        <section className="border-b border-white/10"><div className="site-frame grid md:grid-cols-[170px_1fr]"><div className="flex items-center border-b border-white/10 px-6 py-5 font-mono text-[9px] tracking-[0.2em] text-white/30 md:border-b-0 md:border-r md:px-8">BUILT FOR TEAMS AT</div><div className="partner-marquee overflow-hidden py-5"><div className="partner-track flex min-w-max items-center">{[...partners, ...partners].map((partner, index) => <span key={`${partner}-${index}`} className="px-8 font-mono text-xs font-medium tracking-[0.08em] text-white/42 sm:px-12 sm:text-sm">{partner}</span>)}</div></div></div></section>

        <section id="features" className="border-b border-white/10"><div className="site-frame">
          <div data-reveal className="grid border-b border-white/10 lg:grid-cols-[.9fr_1.1fr]">
            <div className="border-b border-white/10 px-6 py-16 lg:border-b-0 lg:border-r lg:px-8 lg:py-24"><p data-reveal-child className="section-label">[ 01 / INTELLIGENCE LAYER ]</p><h2 data-reveal-child className="mt-8 max-w-md text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">It reads the code around the code.</h2></div>
            <div className="px-6 py-16 lg:px-14 lg:py-24"><p data-reveal-child className="max-w-2xl text-xl leading-8 text-white/62 sm:text-2xl sm:leading-9">Most reviewers see a patch. codeSentinel retrieves architecture, conventions, dependencies, and related files before it says a word.</p><div data-reveal-child className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">{[["150+", "FILES INDEXED"], ["RAG", "GROUNDED CONTEXT"], ["100%", "TRACEABLE OUTPUT"]].map(([value, label]) => <div key={label} className="bg-[#101010] p-5"><p className="text-2xl tracking-[-0.04em] text-white">{value}</p><p className="mt-2 font-mono text-[9px] tracking-[0.16em] text-white/30">{label}</p></div>)}</div></div>
          </div>
          <div className="grid md:grid-cols-3">{features.map((feature, index) => { const Icon = feature.icon; return <article key={feature.title} data-reveal className={`feature-cell group relative min-h-[360px] px-6 py-10 md:px-8 ${index < features.length - 1 ? "md:border-r md:border-white/10" : ""}`}><div data-reveal-child className="flex items-start justify-between"><span className="font-mono text-[10px] text-white/25">/{feature.no}</span><Icon className="size-6 text-[#d7c2a4] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" strokeWidth={1.5} /></div><div className="mt-28"><h3 data-reveal-child className="text-2xl font-medium tracking-[-0.035em]">{feature.title}</h3><p data-reveal-child className="mt-4 max-w-sm text-sm leading-6 text-white/45">{feature.body}</p></div><div className="feature-line" /></article>})}</div>
        </div></section>

        <section id="workflow" className="border-b border-white/10"><div className="site-frame grid lg:grid-cols-[.42fr_1.58fr]">
          <aside className="border-b border-white/10 px-6 py-12 lg:border-b-0 lg:border-r lg:px-8 lg:py-20"><p className="section-label">CONTENTS</p><div className="mt-9 space-y-5 font-mono text-[10px] tracking-[0.06em] text-white/28"><p className="border-l border-[#d7c2a4] pl-4 text-white">01 / CONNECT</p><p className="pl-4">02 / INDEX</p><p className="pl-4">03 / REVIEW</p><p className="pl-4">04 / DECIDE</p></div></aside>
          <div data-reveal className="px-6 py-16 lg:px-14 lg:py-20"><div className="flex flex-wrap items-end justify-between gap-7 border-b border-white/10 pb-10"><div><p data-reveal-child className="section-label">[ 02 / WORKFLOW ]</p><h2 data-reveal-child className="mt-7 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">One connection. Every review.</h2></div><Link data-reveal-child href="/docs" className="micro-link">VIEW DOCUMENTATION <ArrowUpRight className="size-3" /></Link></div>
            <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_.85fr]"><div data-reveal-child className="space-y-2">{[["01", "Connect a repository", "Authorize GitHub and choose what codeSentinel can see."], ["02", "Build repository memory", "Source is chunked and indexed for semantic retrieval."], ["03", "Review on every push", "Findings update automatically as the pull request changes."]].map(([number, title, detail]) => <div key={number} className="workflow-row group grid grid-cols-[42px_1fr_auto] items-center gap-4 border border-white/10 p-4 transition-colors hover:border-[#d7c2a4]/50 hover:bg-[#d7c2a4]/5"><span className="font-mono text-[10px] text-[#d7c2a4]">{number}</span><div><p className="text-sm text-white/85">{title}</p><p className="mt-1 text-xs leading-5 text-white/35">{detail}</p></div><CircleDot className="size-4 text-white/15 transition-colors group-hover:text-[#d7c2a4]" /></div>)}</div>
              <div data-reveal-child className="relative min-h-[300px] overflow-hidden border border-white/10 bg-[#0b0b0b] p-5 font-mono text-[11px]"><CornerMarks /><div className="flex items-center gap-2 border-b border-white/10 pb-4 text-white/30"><Terminal className="size-3.5" /> sentinel / activity</div><div className="mt-6 space-y-5"><p><span className="text-[#45dca2]">✓</span><span className="ml-3 text-white/55">repository connected</span><span className="float-right text-white/20">0.8s</span></p><p><span className="text-[#45dca2]">✓</span><span className="ml-3 text-white/55">150 files indexed</span><span className="float-right text-white/20">4.2s</span></p><p><span className="text-[#45dca2]">✓</span><span className="ml-3 text-white/55">context retrieved</span><span className="float-right text-white/20">1.1s</span></p><p><span className="text-[#d7c2a4]">●</span><span className="ml-3 text-white">reviewing PR #312</span><span className="float-right text-[#d7c2a4]">LIVE</span></p></div><div className="mt-8 h-px overflow-hidden bg-white/10"><div className="activity-progress h-full bg-[#d7c2a4]" /></div><p className="mt-3 text-[9px] tracking-[0.12em] text-white/20">REASONING ACROSS REPOSITORY CONTEXT</p></div>
            </div>
          </div>
        </div></section>

        <section className="relative overflow-hidden border-b border-white/10"><div className="cta-dots absolute inset-0 opacity-30" /><div data-reveal className="site-frame relative px-6 py-24 text-center sm:py-32 lg:px-8"><ScanLine data-reveal-child className="mx-auto size-5 text-[#d7c2a4]" /><p data-reveal-child className="section-label mt-6">THE NEXT REVIEW IS YOURS</p><h2 data-reveal-child className="mx-auto mt-7 max-w-4xl text-balance text-[clamp(2.8rem,6vw,5.8rem)] font-medium leading-[.96] tracking-[-0.06em]">See more. Miss less.<br /><span className="text-[#d7c2a4]">Ship with confidence.</span></h2><p data-reveal-child className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/45">Connect your first repository and get a context-aware review in minutes.</p><div data-reveal-child className="mt-10 flex justify-center"><Link href={ctaHref} className="blue-button group">{ctaLabel}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></div></div></section>
      </main>
      <footer className="bg-[#0b0b0b]"><div className="site-frame flex flex-col justify-between gap-8 px-6 py-10 sm:flex-row sm:items-end lg:px-8"><div><div className="flex items-center gap-2 text-sm font-medium"><ScanLine className="size-4 text-[#d7c2a4]" /> codeSentinel</div><p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-white/25">REPOSITORY REVIEW SYSTEM / 2026</p></div><div className="flex flex-wrap gap-6 font-mono text-[10px] text-white/35"><Link href="/docs" className="hover:text-white">DOCS</Link><Link href="#features" className="hover:text-white">FEATURES</Link><Link href="/login" className="hover:text-white">SIGN IN</Link><span>© {new Date().getFullYear()}</span></div></div></footer>
    </div>
  )
}
