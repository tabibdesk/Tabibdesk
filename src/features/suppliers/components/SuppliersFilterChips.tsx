"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { cx } from "@/lib/utils"
import type { SupplierSpecialty } from "../suppliers.types"

const SPECIALTIES: SupplierSpecialty[] = [
  "Generic Supplies",
  "Dermatology",
  "Ophthalmology",
  "ENT",
  "Gynecology",
  "Dental",
  "Physiotherapy",
]

interface SuppliersFilterChipsProps {
  activeSpecialty: SupplierSpecialty | null
  onSpecialtyChange: (specialty: SupplierSpecialty | null) => void
}

export function SuppliersFilterChips({ activeSpecialty, onSpecialtyChange }: SuppliersFilterChipsProps) {
  const t = useAppTranslations()

  return (
    <div className="flex flex-wrap items-center gap-2 rtl:flex-row-reverse">
      <button
        onClick={() => onSpecialtyChange(null)}
        className={cx(
          "rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all",
          activeSpecialty === null
            ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600"
        )}
      >
        {t.suppliers.filterAll}
      </button>
      {SPECIALTIES.map((specialty) => (
        <button
          key={specialty}
          onClick={() => onSpecialtyChange(specialty)}
          className={cx(
            "rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all",
            activeSpecialty === specialty
              ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600"
          )}
        >
          {specialty}
        </button>
      ))}
    </div>
  )
}
