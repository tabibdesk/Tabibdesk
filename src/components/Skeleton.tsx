"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cx("animate-pulse rounded-md bg-gray-100 dark:bg-gray-800", className)}
      {...props}
    />
  )
})

Skeleton.displayName = "Skeleton"

export { Skeleton }

