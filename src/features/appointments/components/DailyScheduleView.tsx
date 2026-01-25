"use client"

import { useState, useImperativeHandle, forwardRef, Fragment } from "react"
import { DayNavigation } from "./DayNavigation"
import { SlotRow } from "./SlotRow"
import { EmptySlotRow } from "./EmptySlotRow"
import { CancelledSlotRow } from "./CancelledSlotRow"
import { BufferGap } from "./BufferGap"
import { useDailySlots } from "../hooks/useDailySlots"
import { calculateBufferTime } from "../utils/slotFormatters"
import { DEMO_DOCTOR_ID } from "@/data/mock/mock-data"
import type { Slot } from "../types"

interface DailyScheduleViewProps {
  clinicId: string
  doctorId?: string
  onFillSlot: (slot: Slot) => void
  onReschedule?: (slot: Slot) => void
}

export interface DailyScheduleViewRef {
  refetch: () => Promise<void>
}

export const DailyScheduleView = forwardRef<DailyScheduleViewRef, DailyScheduleViewProps>(
  function DailyScheduleView({ clinicId, doctorId, onFillSlot, onReschedule }, ref) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Ensure we have a valid doctorId - use DEMO_DOCTOR_ID if not provided
  const effectiveDoctorId = doctorId || DEMO_DOCTOR_ID
  
  const { slots, loading, error, refetch } = useDailySlots({
    clinicId,
    doctorId: effectiveDoctorId,
    date: currentDate,
  })
  
  // Expose refetch to parent via ref
  useImperativeHandle(ref, () => ({
    refetch: async () => {
      if (refetch) {
        await refetch()
      }
    },
  }))
  
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">Error loading slots: {error.message}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <DayNavigation currentDate={currentDate} onDateChange={setCurrentDate} />
      
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-800 dark:border-t-primary-400"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading slots...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {slots.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm text-gray-500 dark:text-gray-400">No slots available for this day</p>
            </div>
          ) : (
            slots.map((slot, index) => {
              const nextSlot = slots[index + 1]
              const bufferMinutes = nextSlot ? calculateBufferTime(slot, nextSlot) : 0
              
              return (
                <Fragment key={slot.id}>
                  {slot.state === "empty" && (
                    <EmptySlotRow
                      slot={slot}
                      onFillSlot={onFillSlot}
                    />
                  )}
                  {slot.state === "cancelled" && (
                    <CancelledSlotRow
                      slot={slot}
                      onFillSlot={onFillSlot}
                    />
                  )}
                  {slot.state === "booked" && (
                    <SlotRow 
                      slot={slot} 
                      onReschedule={onReschedule}
                      onCancel={async () => {
                        if (slot.appointmentId && refetch) {
                          // Cancel will be handled by SlotRow, then refetch
                          await refetch()
                        }
                      }}
                    />
                  )}
                  
                  {bufferMinutes > 0 && (
                    <BufferGap minutes={bufferMinutes} />
                  )}
                </Fragment>
              )
            })
          )}
        </div>
      )}
    </div>
  )
})
