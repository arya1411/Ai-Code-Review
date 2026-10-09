import Link from "next/link"
import { ArrowUpRight, GitBranch, Menu } from "lucide-react"
import { Logo } from "@/components/brand/logo"

interface MarketingHeaderProps { isAuthenticated: boolean }

export function MarketingHeader({ isAuthenticated }: MarketingHeaderProps) {
  return (
    <header data-site-header className="marketing-header sticky top-0 z-50 border-b border-white/10 bg-[#101010]/90 backdrop-blur-xl">
      <div className="site-frame flex h-[72px] items-center px-6 lg:px-8">
        <div className="flex h-full min-w-0 items-center border-white/10 md:w-[250px] md:border-r"><Logo size="md" /></div>
        <nav className="hidden h-full flex-1 items-center justify-center gap-9 px-5 font-mono text-[10px] tracking-[0.08em] text-white/48 md:flex">
          <a href="#features" className="header-link">PLATFORM</a>
          <a href="#workflow" className="header-link">WORKFLOW</a>
          <Link href="/docs" className="header-link">DOCS</Link>
          <Link href="/terms" className="header-link">TERMS</Link>
          <Link href="/health" className="header-link">STATUS</Link>
        </nav>
        <div className="ml-auto flex h-full items-center border-l border-white/10">
          <a href="https://github.com" aria-label="GitHub" className="hidden h-full w-14 items-center justify-center border-r border-white/10 text-white/45 transition-colors hover:bg-white/5 hover:text-white sm:flex"><GitBranch className="size-4" /></a>
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="hidden h-full items-center px-5 font-mono text-[10px] tracking-[0.06em] text-white/75 transition-colors hover:bg-white/5 hover:text-white sm:flex">{isAuthenticated ? "DASHBOARD" : "LOG IN"}</Link>
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex h-10 items-center gap-2 bg-[#d7c2a4] px-4 font-mono text-[10px] font-medium tracking-[0.06em] text-[#17130f] transition-colors hover:bg-[#e4d2b8] sm:h-full sm:px-6">
            {isAuthenticated ? "OPEN APP" : "GET STARTED"}<ArrowUpRight className="size-3" />
          </Link>
          <button aria-label="Open menu" className="ml-2 flex size-10 items-center justify-center border border-white/10 text-white md:hidden"><Menu className="size-4" /></button>
        </div>
      </div>
    </header>
  )
}
