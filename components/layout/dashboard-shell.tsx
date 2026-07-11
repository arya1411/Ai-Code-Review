import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Logo } from "@/components/brand/logo"
import { Avatar } from "@/components/ui/avatar"
import Logout from "@/components/ui/logout"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
  children: React.ReactNode
  className?: string
}

export function DashboardShell({
  user,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-black">
      <div className="hidden md:flex md:shrink-0">
        <Sidebar user={user} />
      </div>

      <header className="flex h-14 items-center justify-between border-b border-neutral-900 bg-black px-6 md:hidden">
        <Logo href="/dashboard" size="sm" />
        <div className="flex items-center gap-3">
          <Avatar src={user.image} name={user.name} size="sm" />
          <Logout className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Sign out
          </Logout>
        </div>
      </header>

      <main
        className={cn(
          "flex-1 overflow-auto pb-20 md:pb-0 bg-black",
          className
        )}
      >
        {children}
      </main>

      <MobileNav />
    </div>
  )
}
