import Link from "next/link"

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-[70dvh] items-center justify-center bg-[#101010] px-6 text-white">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-[#d7c2a4]">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 text-base text-white/65">This address may have changed, or the page may no longer exist.</p>
        <Link href="/" className="mt-8 inline-flex rounded-md bg-[#d7c2a4] px-5 py-3 text-sm font-semibold text-[#17130f]">Return home</Link>
      </div>
    </main>
  )
}
