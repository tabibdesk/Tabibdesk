"use client"

import React from "react"
import { SearchInput } from "@/components/SearchInput"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { cx } from "@/lib/utils"

interface FeatureToolbarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
  className?: string
}

/**
 * A unified, responsive toolbar for feature pages.
 * Follows the dense design language and provides a consistent
 * layout for search and filters across the application.
 */
export function FeatureToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  children,
  className,
}: FeatureToolbarProps) {
  const t = useAppTranslations()
  const placeholder = searchPlaceholder ?? t.common.searchPlaceholder
  return (
    <div className={cx(
      "flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 md:flex-row md:items-center md:justify-between",
      className
    )}>
      {/* Search Area - Primary on mobile */}
      {onSearchChange !== undefined && (
        <div className="flex-1 min-w-0 max-w-lg">
          <SearchInput
            placeholder={placeholder}
            value={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
      )}

      {/* Filters/Actions Area */}
      {children && (
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {children}
        </div>
      )}
    </div>
  )
}
