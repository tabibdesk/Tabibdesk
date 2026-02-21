"use client"

import { Card, CardContent, CardHeader } from "@/components/Card"
import { Skeleton } from "@/components/Skeleton"

interface CardSkeletonProps {
  /** Number of content lines. Default 3. */
  lines?: number
  /** Remove borders for pure skeleton loading state. Default false. */
  borderless?: boolean
}

/**
 * Card-shaped skeleton for tab content, panels, and card-based layouts.
 */
export function CardSkeleton({ lines = 3, borderless = false }: CardSkeletonProps) {
  const wrapperClass = borderless
    ? "rounded-2xl border-0 bg-transparent shadow-none"
    : undefined

  return (
    <Card className={wrapperClass}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(lines)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
