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
          // Match Input height and styling: same padding as Input (py-1.5), extra right for icon + margin
          "block w-full min-w-0 truncate rounded-md border border-gray-300 bg-white py-1.5 pl-2.5 pr-8 text-left text-sm text-gray-900 shadow-sm",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50",
          "dark:focus:border-primary-400 dark:focus:ring-primary-400",
          "transition outline-none",
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
