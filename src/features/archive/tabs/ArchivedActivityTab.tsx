"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { RiHistoryLine, RiTimeLine } from "@remixicon/react"
import { EmptyState } from "@/components/EmptyState"
import { listActivities } from "@/api/activity.api"
import { ActivityEvent, ActivityEntityType } from "@/types/activity"
import { format } from "date-fns"
import { cx } from "@/lib/utils"
import { useDebounce } from "@/lib/useDebounce"
import Link from "next/link"
import { ArchiveToolbar } from "../components/ArchiveToolbar"
import type { DateRangePreset } from "../archive.types"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"

interface ArchivedActivityTabProps {
  clinicId: string
  searchQuery: string
  onSearchChange: (query: string) => void
  dateRangePreset: DateRangePreset
  customDateRange: DateRange | undefined
  onCustomDateRangeChange: (range: DateRange | undefined) => void
}

export function ArchivedActivityTab({
  clinicId,
  searchQuery,
  onSearchChange,
  dateRangePreset,
  customDateRange,
  onCustomDateRangeChange,
}: ArchivedActivityTabProps) {
  const t = useAppTranslations()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)
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

  const fetchActivities = async (currentPage: number, append = false) => {
    setLoading(true)
    try {
      const dateRange = getDateRange()
      const response = await listActivities({
        clinicId,
        query: debouncedSearch,
        page: currentPage,
        pageSize,
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString(),
      })

      if (append) {
        setEvents((prev) => [...prev, ...response.events])
      } else {
        setEvents(response.events)
      }

      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, debouncedSearch, dateRangePreset, customDateRange, page])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, dateRangePreset, customDateRange])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  if (loading && events.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
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
        searchPlaceholder={t.archive.searchActivity}
      />

      {/* Results Count */}
      {!loading && events.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1 text-start">
          {(total === 1 ? t.archive.foundActivity : t.archive.foundActivityPlural).replace("{n}", String(total))}
        </p>
      )}

      {/* Activity List */}
      {events.length === 0 ? (
        <EmptyState
          icon={RiHistoryLine}
          title={t.archive.noActivityInRange}
          description={t.archive.archivedActivityDescription}
        />
      ) : (
        <>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute start-4 top-0 h-full w-px bg-gray-200 dark:bg-gray-800 md:start-6" />

            <div className="space-y-6">
              {events.map((event) => (
                <ActivityItem key={event.id} event={event} />
              ))}
            </div>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                isLoading={loading}
              >
                {t.archive.loadMore}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const t = useAppTranslations()
  const getEntityLink = (type: ActivityEntityType, id: string) => {
    switch (type) {
      case "patient":
        return `/patients/${id}`
      case "appointment":
        return `/appointments` // Ideally link to drawer/modal
      case "task":
        return `/tasks`
      case "payment":
        return `/accounting`
      default:
        return null
    }
  }

  const link = getEntityLink(event.entityType, event.entityId)

  return (
    <div className="relative ps-10 md:ps-14">
      {/* Icon dot - RTL aware */}
      <div className="absolute start-2 top-1 flex size-5 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-gray-950 dark:ring-gray-950 md:start-4 md:size-6">
        <div
          className={cx(
            "size-2.5 rounded-full md:size-3",
            event.action === "create" || event.action === "book"
              ? "bg-green-500"
              : event.action === "delete" || event.action === "cancel"
                ? "bg-red-500"
                : event.action === "status_change"
                  ? "bg-orange-500"
                  : "bg-primary-500"
          )}
        />
      </div>

      <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {event.actorName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({event.actorRole})
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {event.message}
              </span>
            </div>

            {event.entityLabel && (
              <div className="flex items-center gap-1.5 text-xs font-medium rtl:flex-row-reverse">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.archive.target}:
                </span>
                {link ? (
                  <Link
                    href={link}
                    className="text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {event.entityLabel}
                  </Link>
                ) : (
                  <span className="text-gray-700 dark:text-gray-300">{event.entityLabel}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 sm:shrink-0 rtl:flex-row-reverse">
            <RiTimeLine className="size-3.5 shrink-0" />
            {format(new Date(event.createdAt), "MMM d, h:mm a")}
          </div>
        </div>
      </div>
    </div>
  )
}
