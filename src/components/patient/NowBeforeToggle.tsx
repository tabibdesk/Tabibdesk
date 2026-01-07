"use client"

import { cx } from "@/lib/utils"

interface NowBeforeToggleProps {
  activeMode: "now" | "before"
  onModeChange: (mode: "now" | "before") => void
}

export function NowBeforeToggle({ activeMode, onModeChange }: NowBeforeToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-950">
        <button
          onClick={() => onModeChange("now")}
          className={cx(
            "rounded-md px-8 py-2 text-sm font-medium transition-all duration-200",
            activeMode === "now"
              ? "bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-50"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          )}
        >
          Now
        </button>
        <button
          onClick={() => onModeChange("before")}
          className={cx(
            "rounded-md px-8 py-2 text-sm font-medium transition-all duration-200",
            activeMode === "before"
              ? "bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-50"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          )}
        >
          Before
        </button>
      </div>
    </div>
  )
}

