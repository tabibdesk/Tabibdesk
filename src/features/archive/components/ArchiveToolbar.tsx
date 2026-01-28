"use client"

import { DateRangePicker } from "@/components/DatePicker"
import { Input } from "@/components/Input"
import { RiSearchLine } from "@remixicon/react"
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
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
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
              onChange={onCustomDateRangeChange}
              className="w-full sm:w-fit"
              align="end"
            />
          )}
        </div>
      </div>
    </div>
  )
}
