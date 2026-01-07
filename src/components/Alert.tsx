"use client"

import * as React from "react"
import { cx } from "@/lib/utils"
import {
  RiInformationLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiErrorWarningLine,
} from "@remixicon/react"

export type AlertVariant = "default" | "success" | "warning" | "error"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
}

const variantStyles: Record<AlertVariant, string> = {
  default: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  success:
    "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
  warning:
    "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
}

const iconMap: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  default: RiInformationLine,
  success: RiCheckboxCircleLine,
  warning: RiAlertLine,
  error: RiErrorWarningLine,
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, ...props }, ref) => {
    const Icon = iconMap[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cx(
          "relative rounded-lg border p-4",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <div className="flex gap-3">
          <Icon className="size-5 shrink-0" />
          <div className="flex-1">
            {title && <h5 className="mb-1 font-medium">{title}</h5>}
            <div className="text-sm">{children}</div>
          </div>
        </div>
      </div>
    )
  },
)

Alert.displayName = "Alert"

export { Alert }

