"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { ArchiveToolbar } from "./components/ArchiveToolbar"
import { ArchivedAppointmentsTab } from "./tabs/ArchivedAppointmentsTab"
import { ArchivedTasksTab } from "./tabs/ArchivedTasksTab"
import type { DateRangePreset } from "./archive.types"
import { DateRange } from "react-day-picker"

interface ArchivePageProps {
  clinicId: string
}

export function ArchivePage({ clinicId }: ArchivePageProps) {
  const [activeTab, setActiveTab] = useState<"appointments" | "tasks">("appointments")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archive"
        description="Past appointments and completed tasks"
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "tasks"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Tasks
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
          onDateRangePresetChange={setDateRangePreset}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      ) : (
        <ArchivedTasksTab
          clinicId={clinicId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRangePreset={dateRangePreset}
          onDateRangePresetChange={setDateRangePreset}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      )}
    </div>
  )
}
