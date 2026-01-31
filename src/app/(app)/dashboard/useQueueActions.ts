"use client"

import { updateStatus as updateAppointmentStatus, updateAppointmentTime } from "@/features/appointments/appointments.api"
import { getInvoiceByAppointmentId, markInvoiceUnpaid } from "@/api/invoices.api"
import type { DashboardAppointment } from "./dashboard.types"
import type { QueueStatus } from "./dashboard.types"

export function getTimeDisplay(scheduledAt: string) {
  const now = new Date()
  const scheduled = new Date(scheduledAt)
  const diffMs = scheduled.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (Math.abs(diffHours) < 6) {
    if (diffHours < 0) {
      const hoursAgo = Math.abs(Math.round(diffHours * 10) / 10)
      if (hoursAgo < 1) {
        const minsAgo = Math.abs(Math.round(diffMs / 60000))
        return minsAgo === 0 ? "due now" : `${minsAgo}m ago`
      }
      return `${hoursAgo}h ago`
    } else if (diffHours === 0) {
      return "due now"
    } else {
      const hoursUntil = Math.round(diffHours * 10) / 10
      if (hoursUntil < 1) {
        const minsUntil = Math.round(diffMs / 60000)
        return `in ${minsUntil}m`
      }
      return `in ${hoursUntil}h`
    }
  }
  return scheduled.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

export function getIconColorClass(index: number) {
  if (index === 0) return "text-green-600 dark:text-green-400"
  if (index === 1) return "text-blue-600 dark:text-blue-400"
  return "text-gray-400 dark:text-gray-500"
}

export function getIconBackgroundClass(index: number) {
  if (index === 0) return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
  if (index === 1) return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
  return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
}

export interface UseQueueActionsParams {
  appointments: DashboardAppointment[]
  setAppointments: React.Dispatch<React.SetStateAction<DashboardAppointment[]>>
  paidAppointments: Set<string>
  setPaidAppointments: React.Dispatch<React.SetStateAction<Set<string>>>
  currentUser: { id: string; full_name: string; role: string }
  showToast: (msg: string, variant: "success" | "error") => void
  fetchDashboardData: () => Promise<void>
  loadPaymentStatus: () => Promise<void>
}

export function useQueueActions(params: UseQueueActionsParams) {
  const {
    appointments,
    setAppointments,
    paidAppointments,
    setPaidAppointments,
    currentUser,
    showToast,
    fetchDashboardData,
    loadPaymentStatus,
  } = params

  const updateQueueStatus = async (appointmentId: string, newStatus: QueueStatus | "scheduled") => {
    try {
      let appointmentStatus: "scheduled" | "confirmed" | "in_progress" | "completed" | "no_show" | "cancelled" = "scheduled"
      if (newStatus === "in_progress") appointmentStatus = "in_progress"
      else if (newStatus === "no_show") appointmentStatus = "no_show"
      else if (newStatus === "scheduled") appointmentStatus = "scheduled"

      if (newStatus === "in_progress") {
        await updateAppointmentStatus(appointmentId, appointmentStatus)
        showToast("Patient moved to Active", "success")
      } else if (newStatus !== "scheduled") {
        await updateAppointmentStatus(appointmentId, appointmentStatus)
      }

      if (newStatus === "no_show") {
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
      } else {
        setAppointments((prev) =>
          prev.map((apt) => {
            if (apt.id === appointmentId) {
              return {
                ...apt,
                queueStatus: newStatus === "scheduled" ? undefined : newStatus,
                status: newStatus === "scheduled" ? "scheduled" : apt.status,
              }
            }
            return apt
          })
        )
      }
    } catch {
      showToast("Failed to update appointment status", "error")
    }
  }

  const handleMarkDone = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, "completed")
      showToast("Appointment completed. Patient moved to Active", "success")
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
    } catch {
      showToast("Failed to complete appointment", "error")
    }
  }

  const handleDrop = async (
    draggedIndex: number,
    dropIndex: number,
    setDraggedIndex: (v: number | null) => void,
    setDragOverIndex: (v: number | null) => void
  ) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const draggedItem = appointments[draggedIndex]
    const targetItem = appointments[dropIndex]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetTime = new Date(targetItem.scheduled_at)
    const durationMinutes = 30

    let newScheduledAt: string
    if (draggedIndex < dropIndex) {
      newScheduledAt = new Date(targetTime.getTime() + durationMinutes * 60 * 1000).toISOString()
    } else {
      newScheduledAt = targetTime.toISOString()
    }

    const newDate = new Date(newScheduledAt)
    if (newDate.toDateString() !== today.toDateString()) {
      const hours = targetTime.getHours()
      const minutes = draggedIndex < dropIndex ? targetTime.getMinutes() + durationMinutes : targetTime.getMinutes()
      newDate.setHours(hours, minutes, 0, 0)
      newScheduledAt = newDate.toISOString()
    }

    const newEndAt = new Date(new Date(newScheduledAt).getTime() + durationMinutes * 60 * 1000).toISOString()

    try {
      await updateAppointmentTime(draggedItem.id, newScheduledAt, newEndAt, {
        rescheduledBy: currentUser.id,
        rescheduledByRole: currentUser.role,
        rescheduledByName: currentUser.full_name,
        reason: "Reorganized via drag-and-drop in Today's Appointments widget",
      })
      await fetchDashboardData()
      showToast(
        `Appointment rescheduled to ${new Date(newScheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`,
        "success"
      )
    } catch {
      showToast("Failed to reschedule appointment", "error")
    } finally {
      setDraggedIndex(null)
      setDragOverIndex(null)
    }
  }

  const handleUnmarkPaid = async (
    selectedAppointment: DashboardAppointment,
    onSuccess: () => void
  ) => {
    try {
      const invoice = await getInvoiceByAppointmentId(selectedAppointment.id)
      if (!invoice) {
        showToast("Could not find invoice to reverse", "error")
        return
      }
      await markInvoiceUnpaid(invoice.id)
      showToast("Payment record removed", "success")
      setPaidAppointments((prev) => {
        const next = new Set(prev)
        next.delete(selectedAppointment.id)
        return next
      })
      onSuccess()
      fetchDashboardData()
    } catch {
      showToast("Failed to remove payment record", "error")
    }
  }

  return {
    updateQueueStatus,
    handleMarkDone,
    handleDrop,
    handleUnmarkPaid,
  }
}
