"use client"

import { SearchInput } from "@/components/SearchInput"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiUserAddLine } from "@remixicon/react"

interface PatientsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalPatients: number
  filteredCount?: number
  onAddPatient?: () => void
}

export function PatientsToolbar({
  searchQuery,
  onSearchChange,
  totalPatients,
  filteredCount,
  onAddPatient,
}: PatientsToolbarProps) {
  const t = useAppTranslations()
  return (
    <div className="space-y-3">
      {/* Search + Add Patient */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <SearchInput
          placeholder={t.patients.searchPlaceholder}
          value={searchQuery}
          onSearchChange={onSearchChange}
          className="flex-1 min-w-0"
        />
        {onAddPatient && (
          <button type="button" onClick={onAddPatient} className="btn-search-action rtl:flex-row-reverse">
            <RiUserAddLine className="size-5 shrink-0" />
            {t.patients.addPatient}
          </button>
        )}
      </div>

      {/* Result Count (below the rows) */}
      {searchQuery && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredCount !== undefined
            ? (filteredCount !== 1 ? t.patients.patientsFoundPlural : t.patients.patientsFound).replace("{count}", String(filteredCount))
            : (totalPatients !== 1 ? t.patients.totalPatients : t.patients.totalPatientsSingular).replace("{count}", String(totalPatients))}
        </p>
      )}
    </div>
  )
}
