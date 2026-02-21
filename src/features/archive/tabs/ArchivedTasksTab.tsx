"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { RiTaskLine } from "@remixicon/react"
import { EmptyState } from "@/components/EmptyState"
import { useDebounce } from "@/lib/useDebounce"
import { listArchivedTasks } from "@/api/archive.api"
import { ArchiveTasksTable } from "../components/ArchiveTasksTable"
import { TasksCards } from "@/features/tasks/TasksCards"
import type { TaskListItem } from "@/features/tasks/tasks.types"
import type { ArchivedTaskStatus, DateRangePreset } from "../archive.types"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { mockUsers } from "@/data/mock/users-clinics"

import { ArchiveToolbar } from "../components/ArchiveToolbar"
import { cx } from "@/lib/utils"

interface ArchivedTasksTabProps {
  clinicId: string
  searchQuery: string
  onSearchChange: (query: string) => void
  dateRangePreset: DateRangePreset
  customDateRange: DateRange | undefined
  onCustomDateRangeChange: (range: DateRange | undefined) => void
}

export function ArchivedTasksTab({
  clinicId,
  searchQuery,
  onSearchChange,
  dateRangePreset,
  customDateRange,
  onCustomDateRangeChange,
}: ArchivedTasksTabProps) {
  const t = useAppTranslations()
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilters, setStatusFilters] = useState<ArchivedTaskStatus[]>([])

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

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const dateRange = getDateRange()
      const response = await listArchivedTasks({
        clinicId,
        from: dateRange.from,
        to: dateRange.to,
        query: debouncedSearch,
        status: statusFilters.length > 0 ? statusFilters : undefined,
        page,
        pageSize,
      })
      setTasks((prev) => (page === 1 ? response.items : [...prev, ...response.items]))
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Failed to fetch archived tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, debouncedSearch, dateRangePreset, customDateRange, statusFilters, page])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, dateRangePreset, customDateRange, statusFilters])

  const toggleStatusFilter = (status: ArchivedTaskStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  if (loading && tasks.length === 0) {
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
        customDateRange={customDateRange}
        onCustomDateRangeChange={onCustomDateRangeChange}
        searchPlaceholder={t.archive.searchTasks}
      >
        <div className="flex items-center gap-2 rtl:flex-row-reverse">
          {(["completed", "ignored", "cancelled"] as ArchivedTaskStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => toggleStatusFilter(status)}
              className={cx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border shadow-sm",
                statusFilters.includes(status)
                  ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400"
              )}
            >
              {status === "completed" ? t.archive.statusCompleted : status === "ignored" ? t.archive.statusIgnored : t.archive.statusCancelled}
            </button>
          ))}
        </div>
      </ArchiveToolbar>

      {/* Results Count */}
      {!loading && tasks.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1 text-start">
          {(total === 1 ? t.archive.foundTasks : t.archive.foundTasksPlural).replace("{n}", String(total))}
        </p>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 ? (
        <EmptyState
          icon={RiTaskLine}
          title={t.archive.noCompletedTasks}
          description={t.archive.archivedTasksDescription}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ArchiveTasksTable tasks={tasks} />
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden">
            <TasksCards
              tasks={tasks}
              onMarkDone={() => {}}
              onAssign={() => {}}
              role="doctor"
            />
          </div>

          {/* Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading && page > 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.archive.loadMore}
                  </span>
                ) : (
                  t.archive.loadMore
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
