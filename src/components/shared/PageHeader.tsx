// Tremor Raw PageHeader [v0.0.0]

import React from "react"
import { cx } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions }, forwardedRef) => (
    <div
      ref={forwardedRef}
      className={cx(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pt-3",
        className,
      )}
    >
      <div className="hidden flex-1 space-y-0.5 lg:block">
        <h1 className="text-base font-bold text-gray-900 dark:text-gray-50 sm:text-xl">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  ),
)

PageHeader.displayName = "PageHeader"

export { PageHeader, type PageHeaderProps }
