"use client"

import { useState, useImperativeHandle, forwardRef, Fragment } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { DayNavigation } from "./DayNavigation"
import { SlotRow } from "./SlotRow"
import { EmptySlotRow } from "./EmptySlotRow"
import { CancelledSlotRow } from "./CancelledSlotRow"
import { BufferGap } from "./BufferGap"
import { useDailySlots } from "../hooks/useDailySlots"
import { calculateBufferTime } from "../utils/slotFormatters"
import { DEMO_DOCTOR_ID } from "@/lib/constants"
import { ListSkeleton } from "@/components/skeletons"
import { EmptyState } from "@/components/EmptyState"
import { RiCalendarLine, RiSettings4Line } from "@remixicon/react"
import { useRouter } from "next/navigation"
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
  const t = useAppTranslations()
  const router = useRouter()
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
      <div className="space-y-6">
        <DayNavigation currentDate={currentDate} onDateChange={setCurrentDate} />
        <EmptyState
          variant="card"
          icon={RiSettings4Line}
          title={t.appointments.noAvailability}
          description={t.appointments.noAvailabilityDesc}
          actionLabel={t.nav.settings}
          onAction={() => router.push("/settings")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full">
      <DayNavigation currentDate={currentDate} onDateChange={setCurrentDate} />
      
      {loading ? (
        <div className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800 bg-white dark:bg-gray-900">
          <ListSkeleton rows={8} />
        </div>
      ) : (
        <div className="relative">
          {slots.length === 0 ? (
            <EmptyState
              variant="card"
              icon={RiCalendarLine}
              title={t.appointments.noSlotsAvailable}
              description={t.appointments.noSlotsAvailableDesc}
            />
          ) : (
            <>
              {/* Vertical Timeline Line */}
              <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800 hidden sm:block" />

              <div className="space-y-4">
                {slots.map((slot, index) => {
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
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})
