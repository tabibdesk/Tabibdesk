"use client"

import Link from "next/link"
import { RiCalendarLine, RiPhoneLine, RiAddLine } from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getAppointmentTypeLabel } from "../appointmentTypes"
import { Badge } from "@/components/Badge"
import { formatSlotTime } from "../utils/slotFormatters"
import type { Slot } from "../types"

interface CancelledSlotRowProps {
  slot: Slot
  onFillSlot: (slot: Slot) => void
}

export function CancelledSlotRow({ slot, onFillSlot }: CancelledSlotRowProps) {
  const t = useAppTranslations()
  const startTime = formatSlotTime(slot.startAt)
  const endTime = formatSlotTime(slot.endAt)

  return (
    <div className="relative group">
      {/* Timeline Dot */}
      <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 hidden sm:block bg-red-500 transition-colors" />

      <div className="ms-0 sm:ms-12 transition-all duration-300 rounded-[24px] border border-red-100 bg-red-50/20 dark:bg-red-900/10 dark:border-red-900/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between p-5">
        <div className="flex items-center gap-5">
          {/* Time Indicator */}
          <div className="flex flex-col min-w-[70px]">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{startTime}</span>
            <span className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{endTime}</span>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-red-100/50 dark:bg-red-900/30 hidden md:block" />

          {/* Content */}
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <RiCalendarLine className="size-5 text-red-600 dark:text-red-400" aria-hidden />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {slot.patientName && (
                  <>
                    {slot.patientId ? (
                      <Link
                        href={`/patients/${slot.patientId}`}
                        className="text-sm font-bold text-gray-800 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400"
                      >
                        {slot.patientName}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{slot.patientName}</span>
                    )}
                  </>
                )}
                <Badge color="red" size="xs" className="text-[10px] lowercase font-bold">
                  {t.appointments.cancelled.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                {slot.appointmentType && slot.appointmentType !== "flexible" && (
                  <span>{getAppointmentTypeLabel(slot.appointmentType, t.appointments)}</span>
                )}
                {slot.patientPhone && (
                  <span className="flex items-center gap-1">
                    <RiPhoneLine className="size-3" aria-hidden />
                    {slot.patientPhone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 md:mt-0 flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={() => onFillSlot(slot)}
            className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all shadow-sm active:scale-95"
          >
            <RiAddLine className="size-4" />
            {t.appointments.fillSlot}
          </button>
        </div>
      </div>
    </div>
  )
}
