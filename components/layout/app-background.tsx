import { cn } from "@/lib/utils"

interface AppBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function AppBackground({ children, className }: AppBackgroundProps) {
  return (
    <div className={cn("app-background min-h-screen", className)}>
      {children}
    </div>
  )
}
