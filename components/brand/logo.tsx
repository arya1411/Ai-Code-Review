import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  className?: string
  size?: "sm" | "md"
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("brand-mark inline-flex shrink-0", className)} aria-hidden="true">
      <Image src="/brand/logo.svg" alt="" width={64} height={64} className="size-full object-contain" />
    </span>
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
