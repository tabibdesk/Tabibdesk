"use client"

import React from "react"
import { RiSearchLine, RiSparkling2Line } from "@remixicon/react"
import { inputStyles, type InputProps } from "./Input"
import { cx } from "@/lib/utils"

export interface SearchInputProps extends Omit<InputProps, "type"> {
  onSearchChange?: (value: string) => void
  loading?: boolean
}

/**
 * A unified search input component with an AI-inspired search icon inside the input.
 * Used across the application to provide a consistent search experience.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearchChange, onChange, loading, inputClassName, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onSearchChange?.(e.target.value)
    }

    return (
      <div
        className={cx(
          "group/search relative flex w-full items-center rounded-lg border border-gray-200 bg-gray-50/50 shadow-sm transition-all focus-within:border-primary-500 focus-within:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:focus-within:border-primary-500 dark:focus-within:bg-gray-900",
          "h-9",
          className
        )}
      >
        <span className="pointer-events-none flex shrink-0 items-center gap-1 rounded-l-lg bg-gray-50/50 pl-3 text-gray-400 transition-colors focus-within:text-primary-500 dark:bg-gray-800/50 dark:text-gray-500 group-focus-within/search:dark:bg-gray-900">
          <RiSearchLine className="size-4" />
          <RiSparkling2Line className="size-3.5 opacity-70" />
        </span>
        <input
          ref={ref}
          type="text"
          className={cx(
            inputStyles(),
            "min-w-0 flex-1 border-0 bg-transparent py-2 pl-2 pr-3 shadow-none focus:ring-0 focus-visible:ring-0",
            "h-9 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500",
            inputClassName
          )}
          onChange={handleChange}
          {...props}
        />
        {loading && (
          <span className="flex shrink-0 items-center pr-3">
            <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
          </span>
        )}
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"
