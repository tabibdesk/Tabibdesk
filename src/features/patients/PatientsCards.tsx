"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiPhoneLine, RiCalendarLine, RiUserLine } from "@remixicon/react"
import Link from "next/link"
import type { PatientListItem } from "./patients.types"
import { calculateAge, formatLastVisited } from "./patients.utils"

interface PatientsCardsProps {
  patients: PatientListItem[]
}

export function PatientsCards({ patients }: PatientsCardsProps) {
  const t = useAppTranslations()

  return (
    <div className="flex flex-col gap-3">
      {patients.map((patient) => {
        const age = calculateAge(patient.date_of_birth, patient.age)
        const ageDisplay = typeof age === "number" ? `${age}y` : age

        return (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="widget-row cursor-pointer"
          >
            <div className="widget-content-stack">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <RiUserLine className="size-5 text-gray-500 dark:text-gray-400" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 shrink-0">
                    {ageDisplay} • {patient.gender || "—"}
                  </span>
                </div>
                {patient.complaint ? (
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                      {patient.complaint}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="hidden shrink-0 text-end sm:block ms-4">
                <div className="flex items-center justify-end gap-1.5 text-sm text-gray-900 dark:text-gray-100 rtl:flex-row-reverse">
                  <RiPhoneLine className="size-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden />
                  <span>{patient.phone}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400 rtl:flex-row-reverse">
                  <RiCalendarLine className="size-3.5 shrink-0" aria-hidden />
                  <span>{t.profile.lastVisitLabel} {formatLastVisited(patient.lastAppointmentDate, t)}</span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
