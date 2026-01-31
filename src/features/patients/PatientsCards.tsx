"use client"

import { RiPhoneLine, RiStethoscopeLine, RiUserLine } from "@remixicon/react"
import Link from "next/link"
import type { PatientListItem } from "./patients.types"
import { calculateAge } from "./patients.utils"

interface PatientsCardsProps {
  patients: PatientListItem[]
}

export function PatientsCards({ patients }: PatientsCardsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="flex flex-col gap-3">
      {patients.map((patient) => {
        const age = calculateAge(patient.date_of_birth, patient.age)
        const ageDisplay = typeof age === "number" ? `${age}y` : age

        return (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="card-surface flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
          >
            {/* Avatar */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <RiUserLine className="size-5 text-gray-500 dark:text-gray-400" aria-hidden />
            </div>

            {/* Demographics & complaint */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {patient.first_name} {patient.last_name}
                </span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {ageDisplay}
                </span>
              </div>
              {patient.complaint && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <RiStethoscopeLine className="size-4 shrink-0" aria-hidden />
                  <span className="line-clamp-1 overflow-hidden text-ellipsis italic">
                    {patient.complaint}
                  </span>
                </div>
              )}
            </div>

            {/* Phone & last visited - right-aligned */}
            <div className="hidden shrink-0 text-right sm:block">
              <div className="flex items-center justify-end gap-1.5 text-sm text-gray-900 dark:text-gray-100">
                <RiPhoneLine className="size-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden />
                <span>{patient.phone}</span>
              </div>
              <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                Visited {formatDate(patient.lastAppointmentDate)}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
