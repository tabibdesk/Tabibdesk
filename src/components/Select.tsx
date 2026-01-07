"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cx(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50",
          "dark:focus:border-primary-400 dark:focus:ring-primary-400",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)

Select.displayName = "Select"

export { Select }
