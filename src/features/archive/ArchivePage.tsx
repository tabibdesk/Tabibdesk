"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useSearchParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Select } from "@/components/Select"
import { ArchiveToolbar } from "./components/ArchiveToolbar"
import { ArchivedAppointmentsTab } from "./tabs/ArchivedAppointmentsTab"
import { ArchivedTasksTab } from "./tabs/ArchivedTasksTab"
import { ArchivedActivityTab } from "./tabs/ArchivedActivityTab"
import type { DateRangePreset } from "./archive.types"
import { DateRange } from "react-day-picker"

const VALID_ARCHIVE_TABS = ["appointments", "tasks", "activity"] as const
export type ArchiveTab = (typeof VALID_ARCHIVE_TABS)[number]

function isValidArchiveTab(value: string | null): value is ArchiveTab {
  return value !== null && VALID_ARCHIVE_TABS.includes(value as ArchiveTab)
}

const VALID_DATE_RANGE_PRESETS: DateRangePreset[] = ["7", "30", "90", "custom"]

function isValidDateRangePreset(value: string): value is DateRangePreset {
  return VALID_DATE_RANGE_PRESETS.includes(value as DateRangePreset)
}

interface ArchivePageProps {
  clinicId: string
}

export function ArchivePage({ clinicId }: ArchivePageProps) {
  const t = useAppTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const initialTab: ArchiveTab = isValidArchiveTab(tabParam) ? tabParam : "appointments"

  const [activeTab, setActiveTab] = useState<ArchiveTab>(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)

  // Sync tab with URL param (only accept valid values)
  useEffect(() => {
    if (isValidArchiveTab(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleDateRangeChange = (value: string) => {
    setDateRangePreset(isValidDateRangePreset(value) ? value : "30")
  }

  const handleTabChange = (tab: ArchiveTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`/archive?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="page-content">
      <PageHeader
        title={t.archive.title}
        actions={
          <Select
            id="date-range"
            value={dateRangePreset}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-32"
          >
            <option value="7">{t.archive.last7days}</option>
            <option value="30">{t.archive.last30days}</option>
            <option value="90">{t.archive.last90days}</option>
            <option value="custom">{t.archive.customRange}</option>
          </Select>
        }
      />

      {/* Tabs */}
      <div className="!mt-0 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Archive tabs">
          <button
            onClick={() => handleTabChange("appointments")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.archive.tabAppointments}
          </button>
          <button
            onClick={() => handleTabChange("tasks")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "tasks"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.archive.tabTasks}
          </button>
          <button
            onClick={() => handleTabChange("activity")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "activity"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.archive.tabActivity}
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "appointments" ? (
        <ArchivedAppointmentsTab
          clinicId={clinicId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRangePreset={dateRangePreset}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      ) : activeTab === "tasks" ? (
        <ArchivedTasksTab
          clinicId={clinicId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRangePreset={dateRangePreset}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      ) : (
        <ArchivedActivityTab
          clinicId={clinicId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRangePreset={dateRangePreset}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      )}
    </div>
  )
}
