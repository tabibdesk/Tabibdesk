"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiPhoneLine } from "@remixicon/react"
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
    <div className="group relative flex items-center justify-between p-2 transition-colors bg-red-50/30 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-900/40 shadow-sm opacity-75">
      {/* Status Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
      
      <div className="flex items-center gap-3 flex-1 min-w-0 ml-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{timeRange}</span>
            <Badge variant="error">Cancelled</Badge>
          </div>
          
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {slot.patientId && (
              <Link
                href={`/patients/${slot.patientId}`}
                className="font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                {slot.patientName}
              </Link>
            )}
            {slot.appointmentType && slot.appointmentType !== "flexible" && (
              <span className="text-xs text-gray-500 dark:text-gray-400">• {slot.appointmentType}</span>
            )}
          </div>
          
          {slot.patientPhone && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <RiPhoneLine className="size-3" />
              {slot.patientPhone}
            </div>
          )}
        </div>
        
        <Button variant="primary" size="sm" onClick={() => onFillSlot(slot)}>
          Fill Slot
        </Button>
      </div>
    </div>
  )
}
