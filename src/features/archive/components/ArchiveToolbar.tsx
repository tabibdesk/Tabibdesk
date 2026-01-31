"use client"

import { DateRangePicker } from "@tremor/react"
import { SearchInput } from "@/components/SearchInput"
import type { DateRange } from "react-day-picker"
import type { DateRangePreset } from "../archive.types"

interface ArchiveToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  dateRangePreset: DateRangePreset
  customDateRange: DateRange | undefined
  onCustomDateRangeChange: (range: DateRange | undefined) => void
  searchPlaceholder?: string
  children?: React.ReactNode // For essential status filters
}

export function ArchiveToolbar({
  searchQuery,
  onSearchChange,
  dateRangePreset,
  customDateRange,
  onCustomDateRangeChange,
  searchPlaceholder = "Search archived items...",
  children,
}: ArchiveToolbarProps) {
  const showCustomDatePicker = dateRangePreset === "custom"

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Essential Status Filters */}
          {children}

          {/* Custom Date Range Picker */}
          {showCustomDatePicker && (
            <DateRangePicker
              value={customDateRange}
              onValueChange={(v) => onCustomDateRangeChange(v as DateRange)}
              className="w-full sm:w-fit"
            />
          )}
        </div>
      </div>
    </div>
  )
}
