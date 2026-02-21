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
    "bg-secondary-50 text-secondary-700 border-secondary-100 dark:bg-secondary-900/40 dark:text-secondary-200 dark:border-secondary-700/50",
  black:
    "bg-gray-900 text-white border-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300",
  indigo:
    "bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/40 dark:text-primary-200 dark:border-primary-700/50",
  gray:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-600/50",
  emerald:
    "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6] dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50",
  red:
    "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700/50",
  amber:
    "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50",
  blue:
    "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700/50",
  slate:
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-600/50",
  neutral:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-600/50",
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
          "inline-flex shrink-0 items-center justify-center border whitespace-nowrap transition-colors",
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
