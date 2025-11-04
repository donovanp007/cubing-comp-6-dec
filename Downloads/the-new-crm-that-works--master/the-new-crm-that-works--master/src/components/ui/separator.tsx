"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Orientation = "horizontal" | "vertical"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
}

/**
 * Lightweight replacement for Radix Separator primitive.
 * Uses a simple div with appropriate aria attributes so the app
 * no longer depends on @radix-ui/react-separator (avoids missing dist files).
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? undefined : "separator"}
      aria-orientation={orientation}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)

Separator.displayName = "Separator"

export { Separator }
