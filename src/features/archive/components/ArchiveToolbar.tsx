"use client"

import { useState } from "react"
import { Input } from "@/components/Input"
import { DateRangePicker } from "@/components/DatePicker"
import { RiSearchLine } from "@remixicon/react"
import { subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { DateRangePreset } from "../archive.types"
import { cx } from "@/lib/utils"

interface ArchiveToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  dateRangePreset: DateRangePreset
  onDateRangePresetChange: (preset: DateRangePreset) => void
  customDateRange: DateRange | undefined
  onCustomDateRangeChange: (range: DateRange | undefined) => void
  children?: React.ReactNode // For tab-specific filters
}

export function ArchiveToolbar({
  searchQuery,
  onSearchChange,
  dateRangePreset,
  onDateRangePresetChange,
  customDateRange,
  onCustomDateRangeChange,
  children,
}: ArchiveToolbarProps) {
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(dateRangePreset === "custom")

  const handlePresetChange = (preset: DateRangePreset) => {
    onDateRangePresetChange(preset)
    setShowCustomDatePicker(preset === "custom")
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="space-y-4">
        {/* Main Search and Date Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <RiSearchLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search archived items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 text-sm border-gray-200 focus:border-primary-500 dark:border-gray-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Preset Dropdown */}
            <select
              value={dateRangePreset}
              onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>

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

        {/* Tab-specific Filters Row */}
        {children && (
          <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
