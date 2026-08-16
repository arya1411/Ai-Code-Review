import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string | null
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: { container: "size-7", text: "text-xs", image: 28 },
  md: { container: "size-9", text: "text-sm", image: 36 },
  lg: { container: "size-12", text: "text-base", image: 48 },
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const { container, text, image } = sizeMap[size]
  const initial = name.charAt(0).toUpperCase()

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={image}
        height={image}
        className={cn(
          "rounded-full object-cover ring-1 ring-border",
          container,
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-secondary font-medium text-muted-foreground ring-1 ring-border",
        container,
        text,
        className
      )}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}
