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
        "brand-mark flex shrink-0 items-center justify-center overflow-hidden border border-[#d7c2a4]/50 bg-[#d7c2a4] text-[#17130f]",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-[72%]"
      >
        <path
          d="M9 5.5 4.75 9.75 9 14M15 5.5l4.25 4.25L15 14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M12 3.75v13.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        />
        <path
          d="M8.5 19.25h7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
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
