"use client"

import { Card, CardContent, CardHeader } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { RiCapsuleLine, RiAddLine, RiTimeLine } from "@remixicon/react"
import { Button } from "@/components/Button"
import type { PastMedication } from "@/features/prescriptions/prescriptions.types"
import { format } from "date-fns"
import { useState } from "react"
import { PatientEmptyState } from "@/components/patient/PatientEmptyState"

interface PastMedicationsProps {
  medications: PastMedication[]
  onAddMedication?: () => void
}

const INITIAL_VISIBLE_COUNT = 5
const LOAD_MORE_INCREMENT = 5

export function PastMedications({ medications, onAddMedication }: PastMedicationsProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

  const sortedMedications = [...medications].sort(
    (a, b) => new Date(b.takenFrom).getTime() - new Date(a.takenFrom).getTime()
  )

  const visibleMedications = sortedMedications.slice(0, visibleCount)
  const hasMore = visibleCount < medications.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 min-h-12 flex flex-row items-center justify-start">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <RiCapsuleLine className="size-4 text-primary-500/70 dark:text-primary-400/70" />
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Past Medications</h3>
          </div>
          {onAddMedication && (
            <Button variant="ghost" size="sm" onClick={onAddMedication} className="size-8 shrink-0 p-0" title="Add medication">
              <RiAddLine className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {sortedMedications.length === 0 ? (
          <PatientEmptyState
            icon={RiCapsuleLine}
            title="No past medications yet"
            description="Add past medications to see them here."
            actionLabel={onAddMedication ? "Add medication" : undefined}
            onAction={onAddMedication}
            actionIcon={RiAddLine}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2.5">
              {visibleMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20 p-2.5 transition-colors hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex size-7 items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shrink-0 mt-0.5 shadow-sm">
                    <RiCapsuleLine className="size-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                        {medication.name}
                      </h4>
                      {!medication.takenTo && (
                        <Badge color="emerald" size="xs">
                          Ongoing
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <RiTimeLine className="size-3.5" />
                        <span>{formatDate(medication.takenFrom)}</span>
                        {medication.takenTo && (
                          <>
                            <span className="text-gray-300 dark:text-gray-700">—</span>
                            <span>{formatDate(medication.takenTo)}</span>
                          </>
                        )}
                      </div>
                      {medication.duration && (
                        <div className="text-[11px] text-gray-400 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800 shadow-sm font-medium">
                          {medication.duration}
                        </div>
                      )}
                    </div>

                    {medication.notes && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed bg-white/50 dark:bg-gray-900/50 p-2 rounded border border-gray-100/50 dark:border-gray-800/50 italic">
                        Note: {medication.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  className="w-full text-xs font-bold uppercase tracking-wider h-9 border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Load More Medications
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
