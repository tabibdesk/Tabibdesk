"use client"

import { Badge } from "@/components/Badge"
import { RiCapsuleLine, RiTimeLine } from "@remixicon/react"
import type { Prescription } from "@/features/prescriptions/prescriptions.types"
import { format } from "date-fns"
import { cx } from "@/lib/utils"

interface PrescriptionsTabProps {
  prescriptions: Prescription[]
}

export function PrescriptionsTab({ prescriptions }: PrescriptionsTabProps) {
  // Sort prescriptions by date (newest first)
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (sortedPrescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
        <RiCapsuleLine className="size-12 text-gray-300 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No prescriptions yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">Add a prescription to see it here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedPrescriptions.map((prescription) => (
        <div
          key={prescription.id}
          className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
        >
          {/* Prescription Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(prescription.createdAt), "MMMM d, yyyy")}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 border-l border-gray-200 dark:border-gray-800 pl-3">
                <RiTimeLine className="size-3.5" />
                {format(new Date(prescription.createdAt), "h:mm a")}
              </div>
            </div>
            {prescription.visitType && (
              <Badge variant="neutral" className="text-xs h-5 px-2 uppercase font-bold tracking-wider">
                {prescription.visitType === "in_clinic" ? "In Clinic" : "Online"}
              </Badge>
            )}
          </div>

          <div className="p-4 space-y-4">
            {/* Diagnosis Section */}
            {prescription.diagnosisText && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Diagnosis</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                  {prescription.diagnosisText}
                </p>
              </div>
            )}

            {/* Medications Section */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Medications</p>
              <div className="grid gap-2">
                {prescription.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20 p-2.5"
                  >
                    <div className="flex size-7 items-center justify-center rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shrink-0 mt-0.5 shadow-sm">
                      <RiCapsuleLine className="size-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                          {item.name}
                          {item.strength && <span className="text-gray-500 font-normal ml-1.5 text-xs">({item.strength})</span>}
                        </h4>
                        {item.form && (
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.form}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{item.sig}</p>
                      
                      {(item.duration || item.notes) && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          {item.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800 shadow-sm">
                              <RiTimeLine className="size-3" />
                              {item.duration}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-400 italic font-medium">Note: {item.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Notes Section */}
            {prescription.notesToPatient && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Notes to Patient</p>
                <div className="rounded-lg bg-amber-50/30 dark:bg-amber-900/10 p-2.5 border border-amber-100/50 dark:border-amber-900/20">
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                    {prescription.notesToPatient}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

