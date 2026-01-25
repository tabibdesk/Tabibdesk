"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { RiPhoneLine, RiCalendarLine, RiCloseLine } from "@remixicon/react"
import { formatSlotTime } from "../utils/slotFormatters"
import { updateStatus } from "../appointments.api"
import { useToast } from "@/hooks/useToast"
import { CancelAppointmentModal } from "./CancelAppointmentModal"
import type { Slot } from "../types"

interface SlotRowProps {
  slot: Slot
  onReschedule?: (slot: Slot) => void
  onCancel?: () => void
}

export function SlotRow({ slot, onReschedule, onCancel }: SlotRowProps) {
  if (slot.state !== "booked") return null
  
  const { showToast } = useToast()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  
  const startTime = formatSlotTime(slot.startAt)
  const endTime = formatSlotTime(slot.endAt)
  const timeRange = `${startTime} - ${endTime}`
  
  const handleCancelClick = () => {
    setShowCancelModal(true)
  }
  
  const handleConfirmCancel = async () => {
    if (!slot.appointmentId) return
    
    setIsCancelling(true)
    try {
      await updateStatus(slot.appointmentId, "cancelled")
      showToast("Appointment cancelled successfully", "success")
      setShowCancelModal(false)
      if (onCancel) {
        await onCancel()
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      showToast("Failed to cancel appointment", "error")
    } finally {
      setIsCancelling(false)
    }
  }
  
  const handleReschedule = () => {
    if (onReschedule && slot.appointmentId) {
      onReschedule(slot)
    }
  }
  
  return (
    <div className="group relative flex items-center justify-between p-2 transition-colors bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm">
      {/* Status Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-green-500" />
      
      <div className="flex items-center gap-3 flex-1 min-w-0 ml-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">{timeRange}</span>
            <Badge variant="default">Booked</Badge>
          </div>
          
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {slot.patientId && (
              <Link
                href={`/patients/${slot.patientId}`}
                className="font-medium text-gray-900 hover:text-primary-600 dark:text-gray-50 dark:hover:text-primary-400"
              >
                {slot.patientName}
              </Link>
            )}
            {slot.appointmentType && slot.appointmentType !== "flexible" && (
              <span className="text-xs text-gray-600 dark:text-gray-400">• {slot.appointmentType}</span>
            )}
          </div>
          
          {slot.patientPhone && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <RiPhoneLine className="size-3" />
              {slot.patientPhone}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onReschedule && slot.appointmentId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReschedule}
              className="text-xs"
            >
              <RiCalendarLine className="size-4 mr-1" />
              Reschedule
            </Button>
          )}
          {slot.appointmentId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancelClick}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <RiCloseLine className="size-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>
      
      <CancelAppointmentModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        patientName={slot.patientName}
        appointmentTime={timeRange}
        isLoading={isCancelling}
      />
    </div>
  )
}
