"use client"

import { RiCalendarLine } from "@remixicon/react"
import { Button } from "@/components/Button"
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
  const timeRange = `${startTime} - ${endTime}`

  return (
    <div className="card-surface flex items-center gap-4 px-5 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <RiCalendarLine className="size-5 text-gray-500 dark:text-gray-400" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">{timeRange}</span>
      </div>
      <div className="shrink-0">
        <Button variant="primary" size="sm" onClick={() => onFillSlot(slot)} className="btn-card-action inline-flex items-center gap-2 rtl:flex-row-reverse">
          {t.appointments.fillSlot}
        </Button>
      </div>
    </div>
  )
}
