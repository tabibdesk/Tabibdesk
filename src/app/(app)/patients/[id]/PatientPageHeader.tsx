"use client"

import { Badge } from "@/components/Badge"
import { RiMoneyDollarCircleLine, RiCalendarLine } from "@remixicon/react"

interface PatientPageHeaderProps {
  patient: { first_name: string; last_name: string; age?: number; gender?: string }
  totalDue: number
  lastVisited: string | null
  formatLastVisited: (dateString: string | null) => string
  isNowInQueue: boolean
  lastVisitLabel?: string
}

export function PatientPageHeader({
  patient,
  totalDue,
  lastVisited,
  formatLastVisited,
  isNowInQueue,
  lastVisitLabel = "Last visit:",
}: PatientPageHeaderProps) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-start gap-2">
        <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
          {`${patient.first_name} ${patient.last_name}`}
        </h1>
        <Badge color="gray" size="xs" className="shrink-0 !bg-black !text-white !border-black">
          {patient.age != null ? `${patient.age}y` : "Age N/A"} • {patient.gender}
        </Badge>
        {isNowInQueue && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            live
          </span>
        )}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {lastVisited && (
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <RiCalendarLine className="size-3.5 shrink-0" />
            {lastVisitLabel} {formatLastVisited(lastVisited)}
          </span>
        )}
        {totalDue > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <RiMoneyDollarCircleLine className="size-3.5" />
            Due: {totalDue.toFixed(2)} EGP
          </span>
        )}
      </div>
    </div>
  )
}
