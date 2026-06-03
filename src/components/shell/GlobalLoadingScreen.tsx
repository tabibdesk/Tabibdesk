"use client"

import { useUserClinic } from "@/contexts/user-clinic-context"

export function GlobalLoadingScreen() {
  const { isLoading } = useUserClinic()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loading your clinic data...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Please wait while we set up your workspace
          </p>
        </div>
      </div>
    </div>
  )
}
