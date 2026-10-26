import Link from "next/link"
import { ArrowUpRight, GitBranch, Menu } from "lucide-react"
import { Logo } from "@/components/brand/logo"

interface MarketingHeaderProps { isAuthenticated: boolean }

const navigation = [
  { href: "/#features", label: "Platform" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/terms", label: "Terms" },
  { href: "/health", label: "Status" },
]

export function MarketingHeader({ isAuthenticated }: MarketingHeaderProps) {
  return (
    <header data-site-header className="marketing-header sticky top-0 z-50 border-b border-white/10 bg-[#101010]/90 backdrop-blur-xl">
      <div className="site-frame flex h-[72px] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-w-0 items-center border-white/10 lg:w-[220px] lg:border-r"><Logo size="md" /></div>
        <nav aria-label="Main navigation" className="hidden h-full flex-1 items-center justify-center gap-5 px-5 font-sans text-[14px] font-medium tracking-normal text-white/65 lg:flex">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="header-link">{item.label}</Link>)}
        </nav>
        <div className="ml-auto flex h-full items-center border-l border-white/10">
          <a href="https://github.com" aria-label="GitHub" className="hidden h-full w-14 items-center justify-center border-r border-white/10 text-white/45 transition-colors hover:bg-white/5 hover:text-white sm:flex"><GitBranch className="size-4" /></a>
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="hidden h-full items-center px-5 font-sans text-[14px] font-medium tracking-normal text-white/75 transition-colors hover:bg-white/5 hover:text-white sm:flex">{isAuthenticated ? "Dashboard" : "Log in"}</Link>
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex h-10 items-center gap-2 bg-[#d7c2a4] px-3 font-sans text-[14px] font-semibold tracking-normal text-[#17130f] transition-colors hover:bg-[#e4d2b8] sm:h-full sm:px-6">
            <span className="sm:hidden">{isAuthenticated ? "App" : "Start"}</span><span className="hidden sm:inline">{isAuthenticated ? "Open app" : "Get started"}</span><ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
          <details className="group relative ml-2 lg:hidden">
            <summary aria-label="Navigation menu" className="flex size-10 cursor-pointer list-none items-center justify-center border border-white/10 text-white focus-visible:outline-2 focus-visible:outline-[#d7c2a4] [&::-webkit-details-marker]:hidden"><Menu className="size-4" aria-hidden="true" /></summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-50 w-52 border border-white/15 bg-[#101010] p-2 shadow-xl">
              {navigation.map((item) => <Link key={item.href} href={item.href} className="block px-4 py-3 font-sans text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">{item.label}</Link>)}
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
