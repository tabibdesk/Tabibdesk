"use client"

import { Button } from "@/components/Button"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export default function HomeError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-primary-500 dark:text-primary-400">
          Error
        </p>
        <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Failed to load home
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Something went wrong while loading your home. You can try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Button asChild variant="primary" className="w-full sm:w-auto">
            <Link href={siteConfig.baseLinks.app}>Refresh home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
