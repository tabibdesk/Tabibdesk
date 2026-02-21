"use client"

interface PatientPageHeaderProps {
  patient: { first_name: string; last_name: string }
  isNowInQueue: boolean
}

export function PatientPageHeader({ patient, isNowInQueue }: PatientPageHeaderProps) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start gap-2">
        <h1 className="truncate text-base font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-xl">
          {`${patient.first_name} ${patient.last_name}`}
        </h1>
        {isNowInQueue && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            live
          </span>
        )}
      </div>
    </div>
  )
}
