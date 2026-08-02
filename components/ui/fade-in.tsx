"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * FadeIn Component
 * 
 * A simple animation wrapper that fades in content with a subtle upward motion.
 * Uses the Motion library for smooth, performant animations.
 * 
 * @param children - The content to be animated
 * @param className - Optional additional CSS classes
 * @param delay - Optional delay in seconds before animation starts (default: 0)
 * 
 * @example
 * <FadeIn delay={0.1}>
 *   <h1>Hello World</h1>
 * </FadeIn>
 */
interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      // Initial state: invisible and slightly below final position (6px)
      initial={{ opacity: 1, y: 0 }}
      // Final state: fully visible at correct position
      animate={{ opacity: 1, y: 0 }}
      // Animation configuration: 0.35s duration with custom easing curve and optional delay
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
