import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsContent } from "@/components/docs/docs-content"
import { AppBackground } from "@/components/layout/app-background"

export const metadata: Metadata = {
  title: "Documentation — codeSentinel",
  description:
    "Learn how codeSentinel works: architecture, GitHub integration, AI pipeline, RAG system, tech stack, and API reference.",
}

export default function DocsPage() {
  return (
    <AppBackground>
      {/* ── Docs-specific sticky header ──────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-neutral-900 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-6">
            <Logo href="/" size="sm" />
            <div className="hidden h-4 w-px bg-neutral-800 sm:block" />
            <span className="hidden text-sm text-neutral-500 sm:block">Documentation</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-500 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Layout: sidebar + content ────────────────────────────── */}
      <div className="mx-auto flex max-w-6xl gap-12 px-6 py-12 md:px-10">
        <DocsSidebar />
        <DocsContent />
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-900 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} codeSentinel</p>
          <div className="flex items-center gap-8">
            <Link href="/" className="transition-colors hover:text-white">
              Home
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
