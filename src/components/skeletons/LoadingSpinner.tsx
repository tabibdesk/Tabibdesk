"use client"

import { cx } from "@/lib/utils"

interface LoadingSpinnerProps {
  /** Size: sm (default), md, lg. */
  size?: "sm" | "md" | "lg"
  /** Optional label below spinner. */
  label?: string
  className?: string
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-8 border-2",
  lg: "size-12 border-4",
}

/**
 * Centralized loading spinner. Use for compact areas (modals, panels)
 * where skeleton would be excessive. Prefer skeleton for page/section loads.
 */
export function LoadingSpinner({
  size = "md",
  label,
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center", className)}>
      <div
        className={cx(
          "animate-spin rounded-full border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400",
          sizeClasses[size]
        )}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{label}</p>
      )}
    </div>
  )
}
