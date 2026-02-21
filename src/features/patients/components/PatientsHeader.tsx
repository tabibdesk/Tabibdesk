"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"

interface PatientsHeaderProps {
  activeTab: "active" | "inactive"
  onTabChange: (tab: "active" | "inactive") => void
}

export function PatientsHeader({
  activeTab,
  onTabChange,
}: PatientsHeaderProps) {
  const t = useAppTranslations()
  return (
    <div className="!mt-0 space-y-3">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Patients tabs">
          <button
            onClick={() => onTabChange("active")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.patients.activePatients}
          </button>
          <button
            onClick={() => onTabChange("inactive")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "inactive"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.patients.inactivePatients}
          </button>
        </nav>
      </div>
    </div>
  )
}
