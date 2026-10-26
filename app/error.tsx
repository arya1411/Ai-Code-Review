"use client"

import Link from "next/link"

export default function PageError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-[70dvh] items-center justify-center bg-[#101010] px-6 text-white">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight">This page could not load</h1>
        <p className="mt-4 text-base leading-relaxed text-white/65">Something went wrong while loading this page. Try again, or return home to continue.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={() => retry()} className="rounded-md bg-[#d7c2a4] px-5 py-3 text-sm font-semibold text-[#17130f]">Try again</button>
          <Link href="/" className="rounded-md border border-white/20 px-5 py-3 text-sm font-medium">Go home</Link>
        </div>
      </div>
    </main>
  )
}
