"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cx(
          "size-4 rounded border-gray-300 text-primary-600",
          "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-950",
          className,
        )}
        {...props}
      />
    )
  },
)

Checkbox.displayName = "Checkbox"

export { Checkbox }

