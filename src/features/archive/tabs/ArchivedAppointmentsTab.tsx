"use client"

import { useState, useEffect } from "react"
import { clsx as cx } from "clsx"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { RiCalendarLine } from "@remixicon/react"
import { useDebounce } from "@/lib/useDebounce"
import { listArchivedAppointments } from "@/api/archive.api"
import { ArchiveAppointmentsTable } from "../components/ArchiveAppointmentsTable"
import { AppointmentsCards } from "@/features/appointments/AppointmentsCards"
import type { AppointmentListItem } from "@/features/appointments/appointments.types"
import type { ArchivedAppointmentStatus, DateRangePreset } from "../archive.types"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { mockUsers } from "@/data/mock/users-clinics"
import { mockData } from "@/data/mock/mock-data"

import { ArchiveToolbar } from "../components/ArchiveToolbar"

interface ArchivedAppointmentsTabProps {
  clinicId: string
  searchQuery: string
  onSearchChange: (query: string) => void
  dateRangePreset: DateRangePreset
  onDateRangePresetChange: (preset: DateRangePreset) => void
  customDateRange: DateRange | undefined
  onCustomDateRangeChange: (range: DateRange | undefined) => void
}

export function ArchivedAppointmentsTab({
  clinicId,
  searchQuery,
  onSearchChange,
  dateRangePreset,
  onDateRangePresetChange,
  customDateRange,
  onCustomDateRangeChange,
}: ArchivedAppointmentsTabProps) {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilters, setStatusFilters] = useState<ArchivedAppointmentStatus[]>([])
  const [doctorFilter, setDoctorFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")

  const debouncedSearch = useDebounce(searchQuery, 250)
  const pageSize = 20

  // Get date range from preset or custom
  const getDateRange = (): { from?: Date; to?: Date } => {
    if (dateRangePreset === "custom" && customDateRange?.from && customDateRange?.to) {
      return { from: customDateRange.from, to: customDateRange.to }
    }
    if (dateRangePreset !== "custom") {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const from = subDays(today, parseInt(dateRangePreset))
      from.setHours(0, 0, 0, 0)
      return { from, to: today }
    }
    return {}
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const dateRange = getDateRange()
      const response = await listArchivedAppointments({
        clinicId,
        from: dateRange.from,
        to: dateRange.to,
        query: debouncedSearch,
        status: statusFilters.length > 0 ? statusFilters : undefined,
        doctorId: doctorFilter || undefined,
        type: typeFilter || undefined,
        page,
        pageSize,
      })
      setAppointments(response.items)
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Failed to fetch archived appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, debouncedSearch, dateRangePreset, customDateRange, statusFilters, doctorFilter, typeFilter, page])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, dateRangePreset, customDateRange, statusFilters, doctorFilter, typeFilter])

  const toggleStatusFilter = (status: ArchivedAppointmentStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  // Get unique doctors from appointments
  // Note: In a real implementation, this would come from the API
  const doctors = Array.from(
    new Set(
      appointments
        .map((apt) => {
          const mockApt = mockData.appointments.find((a: any) => a.id === apt.id)
          return mockApt?.doctor_id
        })
        .filter(Boolean)
    )
  )

  // Get unique types
  const types = Array.from(new Set(appointments.map((apt) => apt.type)))

  if (loading && appointments.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ArchiveToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        dateRangePreset={dateRangePreset}
        onDateRangePresetChange={onDateRangePresetChange}
        customDateRange={customDateRange}
        onCustomDateRangeChange={onCustomDateRangeChange}
      >
        <div className="flex flex-wrap items-center gap-4 w-full">
          {/* Status Multi-select (Compact) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Status:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(["completed", "cancelled", "no_show"] as ArchivedAppointmentStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={cx(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all border",
                    statusFilters.includes(status)
                      ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400"
                  )}
                >
                  <span className="capitalize">{status.replace("_", " ")}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          {/* Doctor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Doctor:
            </span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-8 rounded-md border border-gray-200 bg-transparent px-2 py-0 text-xs text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:text-gray-300"
            >
              <option value="">All Doctors</option>
              {doctors.map((doctorId) => {
                const doctor = mockUsers.find((u) => u.id === doctorId)
                return (
                  <option key={doctorId} value={doctorId}>
                    {doctor?.full_name || doctorId}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Type:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-gray-200 bg-transparent px-2 py-0 text-xs text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:text-gray-300"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ArchiveToolbar>

      {/* Results Count */}
      {!loading && appointments.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
          Found {total} archived appointment{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Empty State */}
      {!loading && appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiCalendarLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No archived appointments in this range.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ArchiveAppointmentsTable appointments={appointments} />
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden">
            <AppointmentsCards
              appointments={appointments}
              onReschedule={() => {}}
              onCancel={() => {}}
            />
          </div>

          {/* Pagination */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                isLoading={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
