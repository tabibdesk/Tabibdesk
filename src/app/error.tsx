"use client"

import { Button } from "@/components/Button"
import Link from "next/link"
import { siteConfig } from "./siteConfig"

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-primary-500 dark:text-primary-400">
          Error
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You can try again or head back to home.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            Try again
          </Button>
          <Button asChild variant="primary" className="w-full sm:w-auto">
            <Link href={siteConfig.baseLinks.app}>Go to home</Link>
          </Button>
        </div>
        <Link
          href={siteConfig.baseLinks.app}
          className="mt-12 inline-block text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {siteConfig.name}
        </Link>
      </div>
    </div>
  )
}
