"use client"

import { Card } from "@/components/Card"
import { Skeleton } from "@/components/Skeleton"

/**
 * Skeleton for summary/dashboard-style pages with header, KPI grid, and content.
 */
export function SummarySkeleton() {
  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </Card>
  )
}
