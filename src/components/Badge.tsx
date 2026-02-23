"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

export type BadgeColor =
  | "indigo"
  | "gray"
  | "emerald"
  | "red"
  | "amber"
  | "blue"
  | "slate"
  | "neutral"
  | "brand"
  | "black"

export type BadgeSize = "xs" | "sm" | "md"

const COLOR_STYLES: Record<BadgeColor, string> = {
  brand:
    "bg-secondary-50 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-200",
  black:
    "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900",
  indigo:
    "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200",
  gray:
    "bg-secondary-600 text-white dark:bg-secondary-500 dark:text-white",
  emerald:
    "bg-[#E6F4EA] text-[#137333] dark:bg-emerald-900/40 dark:text-emerald-200",
  red:
    "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  amber:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  blue:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  slate:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  neutral:
    "bg-secondary-600 text-white dark:bg-secondary-500 dark:text-white",
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  xs: "px-2.5 py-0.5 text-xs font-medium",
  sm: "px-3 py-1 text-sm font-medium",
  md: "px-3.5 py-1 text-sm font-semibold",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
  size?: BadgeSize
  rounded?: "md" | "full"
  /** @deprecated Use color instead; icon not supported in custom Badge */
  icon?: React.ElementType
  tooltip?: string
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = "gray", size = "xs", rounded = "md", className, children, title, tooltip, ...props }, ref) => {
    return (
      <span
        ref={ref}
        title={tooltip ?? title}
        className={cx(
          "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors",
          rounded === "full" ? "rounded-full" : "rounded-md",
          COLOR_STYLES[color as BadgeColor] ?? COLOR_STYLES.gray,
          SIZE_STYLES[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"
