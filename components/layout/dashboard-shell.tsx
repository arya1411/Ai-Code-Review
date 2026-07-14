import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Logo } from "@/components/brand/logo"
import { Avatar } from "@/components/ui/avatar"
import Logout from "@/components/ui/logout"
import { cn } from "@/lib/utils"

/**
 * DashboardShell Component
 * 
 * This component provides the main layout wrapper for all dashboard pages.
 * It handles responsive layout switching between desktop (sidebar) and mobile (header + bottom nav).
 * 
 * @param user - The authenticated user object containing name, email, and avatar
 * @param children - The page content to be rendered within the dashboard layout
 * @param className - Optional additional CSS classes for the main content area
 */
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
      {/* Desktop Sidebar - Hidden on mobile, visible on md screens and up */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Header - Only visible on small screens */}
      <header className="flex h-14 items-center justify-between border-b border-neutral-900 bg-black px-6 md:hidden">
        <Logo href="/dashboard" size="sm" />
        <div className="flex items-center gap-3">
          <Avatar src={user.image} name={user.name} size="sm" />
          <Logout className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Sign out
          </Logout>
        </div>
      </header>

      {/* Main Content Area - Scrollable with padding for mobile nav */}
      <main
        className={cn(
          "flex-1 overflow-auto pb-20 md:pb-0 bg-black",
          className
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      <MobileNav />
    </div>
  )
}
