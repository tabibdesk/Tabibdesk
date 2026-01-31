"use client"

import { Skeleton } from "@/components/Skeleton"

interface ListSkeletonProps {
  /** Number of rows. Default 5. */
  rows?: number
  /** Optional header skeleton. */
  showHeader?: boolean
}

/**
 * Generic list/table row skeleton. Use for lists, tables, and feed-style content.
 */
export function ListSkeleton({
  rows = 5,
  showHeader = false,
}: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {showHeader && (
        <Skeleton className="h-5 w-32" />
      )}
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}
