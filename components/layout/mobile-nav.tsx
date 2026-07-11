"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GitPullRequest,
  LayoutDashboard,
  Settings,
  FolderGit2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reviews", href: "/reviews", icon: GitPullRequest },
  { label: "Repositories", href: "/repositories", icon: FolderGit2 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-neutral-900 bg-black px-2 py-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
