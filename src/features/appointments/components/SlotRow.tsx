"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { RiPhoneLine, RiCalendarLine, RiCloseLine, RiUserLine } from "@remixicon/react"
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

  if (slot.state !== "booked") {
    return null
  }

  return (
    <div className="card-surface flex items-center gap-4 px-5 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
        <RiUserLine className="size-5 text-primary-600 dark:text-primary-400" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {slot.patientId ? (
            <Link
              href={`/patients/${slot.patientId}`}
              className="font-medium text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400"
            >
              {slot.patientName}
            </Link>
          ) : (
            <span className="font-medium text-gray-900 dark:text-gray-100">{timeRange}</span>
          )}
          <Badge variant="default" className="text-[10px] px-1.5 py-0 uppercase font-bold tracking-wider">
            Booked
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{timeRange}</span>
          {slot.appointmentType && slot.appointmentType !== "flexible" && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>{slot.appointmentType}</span>
            </>
          )}
        </div>
        {slot.patientPhone && (
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <RiPhoneLine className="size-4 shrink-0" aria-hidden />
            <span>{slot.patientPhone}</span>
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {onReschedule && slot.appointmentId && (
          <Button variant="secondary" size="sm" onClick={handleReschedule} className="btn-card-action">
            <RiCalendarLine className="size-4 mr-1" />
            Reschedule
          </Button>
        )}
        {slot.appointmentId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelClick}
            className="btn-card-action text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <RiCloseLine className="size-4 mr-1" />
            Cancel
          </Button>
        )}
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
