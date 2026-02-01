"use client"

import React, { useEffect } from "react"
import { SearchInput } from "@/components/SearchInput"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useDebounce } from "@/lib/useDebounce"
import { RiFilterLine } from "@remixicon/react"

export type DateRangePreset = "today" | "7days" | "30days" | "90days" | "thismonth" | "custom" | "all"

export interface AccountingToolbarProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  searchPlaceholder?: string
  showFilters?: boolean
  onFiltersToggle?: () => void
}

export function AccountingToolbar({
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  showFilters = false,
  onFiltersToggle,
}: AccountingToolbarProps) {
  const t = useAppTranslations()
  const placeholder = searchPlaceholder ?? t.common.searchPlaceholder
  const debouncedSearch = useDebounce(searchQuery, 250)

  // Update parent when debounced search changes
  useEffect(() => {
    onSearchQueryChange(debouncedSearch)
  }, [debouncedSearch, onSearchQueryChange])

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Search Bar */}
      <div className="flex-1 min-w-0 w-full">
        <SearchInput
          placeholder={placeholder}
          value={searchQuery}
          onSearchChange={onSearchQueryChange}
        />
      </div>

      {/* Filters Button (for mobile) */}
      {onFiltersToggle && (
        <button
          onClick={onFiltersToggle}
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition sm:hidden ${
            showFilters
              ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-400"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <RiFilterLine className="size-4" />
          Filters
        </button>
      )}
    </div>
  )
}
