"use client"

import { Skeleton } from "@/components/Skeleton"

interface WidgetSkeletonProps {
  /** Number of widget rows to show. Default 5. */
  rows?: number
}

/**
 * Skeleton for dashboard widgets (Now Queue, Today's Appointments).
 * Matches the widget-row structure for consistent loading UX.
 */
export function WidgetSkeleton({ rows = 5 }: WidgetSkeletonProps) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="widget-row">
          <div className="widget-content-stack">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
