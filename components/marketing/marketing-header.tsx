import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

interface MarketingHeaderProps {
  isAuthenticated: boolean
}

export function MarketingHeader({ isAuthenticated }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-900 bg-black">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 md:px-10">
        <Logo href="/" size="sm" />

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button render={<Link href="/dashboard" />} size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-neutral-400 hover:text-white"
              >
                Sign in
              </Button>
              <Button render={<Link href="/login" />} size="sm">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
