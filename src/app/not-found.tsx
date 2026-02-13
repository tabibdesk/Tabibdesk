import { Button } from "@/components/Button"
import { RiArrowRightLine } from "@remixicon/react"
import Link from "next/link"
import { BrandName } from "@/components/shared/BrandName"
import { siteConfig } from "./siteConfig"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link href={siteConfig.baseLinks.dashboard}>
        <div className="mt-6 flex items-center gap-x-0.5">
          <img src="/logo.svg" alt="" className="size-[2rem] object-contain" aria-hidden />
          <BrandName className="text-xl text-gray-900 dark:text-gray-50" />
        </div>
      </Link>
      <p className="mt-6 text-4xl font-semibold text-indigo-600 sm:text-5xl dark:text-indigo-500">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Button asChild className="group mt-8" variant="light">
        <Link href={siteConfig.baseLinks.dashboard}>
          Go to dashboard
          <RiArrowRightLine
            className="ml-1.5 size-5 text-gray-900 dark:text-gray-50"
            aria-hidden="true"
          />
        </Link>
      </Button>
    </div>
  )
}
