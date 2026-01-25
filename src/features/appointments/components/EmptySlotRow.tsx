"use client"

import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { formatSlotTime } from "../utils/slotFormatters"
import type { Slot } from "../types"

interface EmptySlotRowProps {
  slot: Slot
  onFillSlot: (slot: Slot) => void
}

export function EmptySlotRow({ slot, onFillSlot }: EmptySlotRowProps) {
  const startTime = formatSlotTime(slot.startAt)
  const endTime = formatSlotTime(slot.endAt)
  const timeRange = `${startTime} - ${endTime}`
  
  return (
    <div className="group relative flex items-center justify-between p-2 transition-colors bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm">
      {/* Status Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gray-200 dark:bg-gray-700" />
      
      <div className="flex items-center gap-3 flex-1 min-w-0 ml-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">{timeRange}</span>
            <Badge variant="neutral">Empty</Badge>
          </div>
          
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Available for booking
          </div>
        </div>
        
        <Button variant="primary" size="sm" onClick={() => onFillSlot(slot)}>
          Fill Slot
        </Button>
      </div>
    </div>
  )
}
