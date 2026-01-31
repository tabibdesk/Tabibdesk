"use client"

import { Skeleton } from "@/components/Skeleton"

interface PageSkeletonProps {
  /** Show header placeholder. Default true. */
  showHeader?: boolean
  /** Number of content blocks. Default 1. */
  contentBlocks?: number
}

/**
 * Skeleton for full page loads (e.g. patient detail, settings).
 * Provides header + content area placeholders.
 */
export function PageSkeleton({
  showHeader = true,
  contentBlocks = 1,
}: PageSkeletonProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}
      <div className="space-y-4">
        {[...Array(contentBlocks)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
