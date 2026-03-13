"use client"

import { useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getAppointmentTypeLabel } from "../appointmentTypes"
import Link from "next/link"
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
  const t = useAppTranslations()
  const { showToast } = useToast()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const startTime = formatSlotTime(slot.startAt)
  const endTime = formatSlotTime(slot.endAt)

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
    <div className="relative group">
      <div className="transition-all duration-300 rounded-2xl border border-primary-100 bg-white dark:bg-gray-900 dark:border-primary-900/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between p-5 hover:ring-1 hover:ring-primary-50 dark:hover:ring-primary-900/20">
        <div className="flex items-center gap-5">
          {/* Time Indicator */}
          <div className="flex flex-col min-w-[70px]">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">{startTime}</span>
            <span className="text-[11px] font-medium text-gray-400 mt-0.5 uppercase tracking-wider">{endTime}</span>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 hidden md:block" />

          {/* Content */}
          <div className="flex items-center gap-4">
            <div className="avatar-patient">
              <RiUserLine className="size-5" aria-hidden />
            </div>
            <div className="flex flex-col">
              <Link
                href={`/patients/${slot.patientId}`}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-gray-900 dark:hover:text-black transition-colors"
              >
                {slot.patientName}
              </Link>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                {slot.appointmentType && slot.appointmentType !== "flexible" && (
                  <span className="flex items-center gap-1">
                    {getAppointmentTypeLabel(slot.appointmentType, t.appointments)}
                  </span>
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

        {/* Action Buttons */}
        <div className="mt-4 md:mt-0 flex items-center gap-3 self-end md:self-auto">
          {onReschedule && slot.appointmentId && (
            <button
              type="button"
              onClick={handleReschedule}
              className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all"
            >
              <RiCalendarLine className="size-4" />
              {t.appointments.reschedule}
            </button>
          )}
          {slot.appointmentId && (
            <button
              type="button"
              onClick={handleCancelClick}
              className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all"
            >
              <RiCloseLine className="size-4" />
              {t.common.cancel}
            </button>
          )}
        </div>
      </div>

      <CancelAppointmentModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        patientName={slot.patientName}
        appointmentTime={`${startTime} - ${endTime}`}
        isLoading={isCancelling}
      />
    </div>
  )
}
