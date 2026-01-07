"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cx(
            "peer h-6 w-11 rounded-full bg-gray-200",
            "after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
            "peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white",
            "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "dark:border-gray-600 dark:bg-gray-700",
            "dark:peer-checked:bg-primary-600 dark:peer-focus:ring-primary-800",
            className,
          )}
        />
      </label>
    )
  },
)

Switch.displayName = "Switch"

export { Switch }

