import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  className?: string
  size?: "sm" | "md"
}

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-primary",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="size-[55%] text-primary-foreground"
      >
        <path
          d="M4 12L8 4L12 12H9.5L8 9L6.5 12H4Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export function Logo({ href = "/", className, size = "md" }: LogoProps) {
  const markSize = size === "sm" ? "size-6" : "size-7"
  const textSize = size === "sm" ? "text-sm" : "text-[15px]"

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={markSize} />
      <span
        className={cn(
          "font-semibold tracking-[-0.02em] text-foreground",
          textSize
        )}
      >
        codeSentinel
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-80">
        {content}
      </Link>
    )
  }

  return content
}
