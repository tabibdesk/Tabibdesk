"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cx(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-500",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50",
          "dark:placeholder:text-gray-500",
          "dark:focus:border-primary-400 dark:focus:ring-primary-400",
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = "Textarea"

export { Textarea }

