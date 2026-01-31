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

export type BadgeSize = "xs" | "sm" | "md"

const COLOR_STYLES: Record<BadgeColor, string> = {
  indigo:
    "bg-indigo-100 text-indigo-800 border-indigo-200/80 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-700/50",
  gray:
    "bg-gray-100 text-gray-700 border-gray-200/80 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-600/50",
  emerald:
    "bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50",
  red:
    "bg-red-100 text-red-800 border-red-200/80 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700/50",
  amber:
    "bg-amber-100 text-amber-800 border-amber-200/80 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50",
  blue:
    "bg-blue-100 text-blue-800 border-blue-200/80 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700/50",
  slate:
    "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-600/50",
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-600/50",
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  xs: "px-2.5 py-0.5 text-xs font-medium",
  sm: "px-3 py-1 text-sm font-medium",
  md: "px-3.5 py-1 text-sm font-semibold",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
  size?: BadgeSize
  /** @deprecated Use color instead; icon not supported in custom Badge */
  icon?: React.ElementType
  tooltip?: string
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = "gray", size = "xs", className, children, title, tooltip, ...props }, ref) => {
    return (
      <span
        ref={ref}
        title={tooltip ?? title}
        className={cx(
          "inline-flex shrink-0 items-center justify-center rounded-md border whitespace-nowrap transition-colors",
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
