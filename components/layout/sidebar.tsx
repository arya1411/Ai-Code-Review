"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GitPullRequest,
  LayoutDashboard,
  Settings,
  FolderGit2,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Avatar } from "@/components/ui/avatar"
import Logout from "@/components/ui/logout"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reviews", href: "/reviews", icon: GitPullRequest },
  { label: "Repositories", href: "/repositories", icon: FolderGit2 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-neutral-900 bg-black">
      <div className="flex h-14 items-center px-6">
        <Logo href="/dashboard" size="sm" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-950/50"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-3 pb-6 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 border-t border-neutral-900 pt-4">
          <Avatar src={user.image} name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {user.email}
            </p>
          </div>
        </div>
        <Logout className="flex w-full items-center justify-center rounded-lg border border-neutral-900 bg-neutral-950 px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
          Sign out
        </Logout>
      </div>
    </aside>
  )
}
