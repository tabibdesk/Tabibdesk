"use client"

import { RiCalendarLine, RiAddLine } from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { formatSlotTime } from "../utils/slotFormatters"
import type { Slot } from "../types"

interface EmptySlotRowProps {
  slot: Slot
  onFillSlot: (slot: Slot) => void
}

export function EmptySlotRow({ slot, onFillSlot }: EmptySlotRowProps) {
  const t = useAppTranslations()
  const startTime = formatSlotTime(slot.startAt)
  const endTime = formatSlotTime(slot.endAt)

  return (
    <div className="relative group">
      {/* Timeline Dot */}
      <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 hidden sm:block bg-gray-300 transition-colors group-hover:bg-primary-400" />

      <div className="ms-0 sm:ms-12 transition-all duration-300 rounded-[24px] border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between p-5 hover:border-primary-200 dark:hover:border-primary-800">
        <div className="flex items-center gap-5">
          {/* Time Indicator */}
          <div className="flex flex-col min-w-[70px]">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{startTime}</span>
            <span className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{endTime}</span>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 hidden md:block" />

          {/* Content */}
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400">
              <RiCalendarLine className="size-5" aria-hidden />
            </div>
            <span className="text-sm font-medium text-gray-400">
              {t.appointments.availableTimeSlot}
            </span>
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
