"use client"

import Link from "next/link"
import { RiCalendarLine, RiPhoneLine } from "@remixicon/react"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { formatSlotTime } from "../utils/slotFormatters"
import type { Slot } from "../types"

interface CancelledSlotRowProps {
  slot: Slot
  onFillSlot: (slot: Slot) => void
}

export function CancelledSlotRow({ slot, onFillSlot }: CancelledSlotRowProps) {
  const startTime = formatSlotTime(slot.startAt)
  const endTime = formatSlotTime(slot.endAt)
  const timeRange = `${startTime} - ${endTime}`

  return (
    <div className="card-surface flex items-center gap-4 px-5 py-4 border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <RiCalendarLine className="size-5 text-red-600 dark:text-red-400" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">{timeRange}</span>
          <Badge color="red" size="xs">
            Cancelled
          </Badge>
        </div>
        {slot.patientName && (
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {slot.patientId ? (
              <Link
                href={`/patients/${slot.patientId}`}
                className="font-medium hover:text-primary-600 dark:hover:text-primary-400"
              >
                {slot.patientName}
              </Link>
            ) : (
              <span>{slot.patientName}</span>
            )}
            {slot.appointmentType && slot.appointmentType !== "flexible" && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>{slot.appointmentType}</span>
              </>
            )}
          </div>
        )}
        {slot.patientPhone && (
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <RiPhoneLine className="size-4 shrink-0" aria-hidden />
            <span>{slot.patientPhone}</span>
          </div>
        )}
      </div>
      <div className="shrink-0">
        <Button variant="primary" size="sm" onClick={() => onFillSlot(slot)} className="btn-card-action">
          Fill Slot
        </Button>
      </div>
    </div>
  )
}
