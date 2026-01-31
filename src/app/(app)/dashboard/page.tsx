"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { WidgetSkeleton } from "@/components/skeletons"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useDemo } from "@/contexts/demo-context"
import { mockAppointments, mockData } from "@/data/mock/mock-data"
import { updateStatus as updateAppointmentStatus, updateAppointmentTime } from "@/features/appointments/appointments.api"
import { listPayments } from "@/api/payments.api"
import { getInvoiceByAppointmentId, markInvoiceUnpaid } from "@/api/invoices.api"
import { InvoiceDrawer } from "@/features/accounting/components/InvoiceDrawer"
import { useToast } from "@/hooks/useToast"
import type { PatientAppointment } from "@/features/accounting/components/InvoiceDrawer"
import {
  RiCalendarLine,
  RiArrowRightLine,
  RiUserLine,
  RiMenuLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiMoneyDollarCircleLine,
  RiCloseLine,
} from "@remixicon/react"

// Unified Types
type QueueStatus = "now" | "next" | "waiting" | "online_now" | "no_show" | "in_progress"

interface DashboardAppointment {
  id: string
  patient_id: string
  patientName: string
  time: string
  scheduled_at: string
  type: string
  status: string
  queueStatus?: QueueStatus
  online_call_link?: string
}

function buildCreateInvoiceAppointments(apt: DashboardAppointment): PatientAppointment[] {
  const full = mockData.appointments.find((a) => a.id === apt.id)
  if (!full) {
    return [
      {
        id: apt.id,
        patient_id: apt.patient_id,
        scheduled_at: apt.scheduled_at,
        type: apt.type || "Consultation",
        status: apt.status,
        doctor_id: null,
        clinic_id: null,
      },
    ]
  }
  return [
    {
      id: full.id,
      patient_id: full.patient_id,
      scheduled_at: full.scheduled_at,
      type: full.type,
      status: full.status,
      doctor_id: full.doctor_id ?? null,
      clinic_id: full.clinic_id ?? null,
    },
  ]
}

export default function DashboardPage() {
  const { currentUser, currentClinic } = useUserClinic()
  const { isDemoMode } = useDemo()
  const { showToast } = useToast()
  const role = currentUser.role

  // Unified state
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showNoShowModal, setShowNoShowModal] = useState(false)
  const [appointmentToMarkNoShow, setAppointmentToMarkNoShow] = useState<string | null>(null)
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)
  const [paidAppointments, setPaidAppointments] = useState<Set<string>>(new Set())
  const [markingArrived, setMarkingArrived] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)

  // Confirmation Modals State
  const [showArrivedModal, setShowArrivedModal] = useState(false)
  const [showCreateInvoiceDrawer, setShowCreateInvoiceDrawer] = useState(false)
  const [showUnmarkArrivedModal, setShowUnmarkArrivedModal] = useState(false)
  const [showUnmarkPaidModal, setShowUnmarkPaidModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<DashboardAppointment | null>(null)

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, role])

  // Load payment status for appointments
  useEffect(() => {
    if (isDemoMode && appointments.length > 0 && currentClinic) {
      loadPaymentStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, isDemoMode, currentClinic])

  const loadPaymentStatus = async () => {
    if (!currentClinic) return
    
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split("T")[0]
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split("T")[0]
      
      const payments = await listPayments({
        clinicId: currentClinic.id,
        from: todayStr,
        to: tomorrowStr,
        page: 1,
        pageSize: 1000,
      })
      
      const paidSet = new Set<string>()
      payments.payments.forEach((payment) => {
        if (payment.appointmentId) {
          paidSet.add(payment.appointmentId)
        }
      })
      
      setPaidAppointments(paidSet)
    } catch (error) {
      console.error("Failed to load payment status:", error)
    }
  }

  // Unified Dashboard Data Fetching
  const fetchDashboardData = async () => {
    setLoading(true)

    if (isDemoMode) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayAppts = mockAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduled_at)
        return aptDate >= today && aptDate < tomorrow
      })

      if (role === "doctor") {

        const queueStatuses: QueueStatus[] = ["in_progress", "next", "waiting", "online_now"]
        const queueData = todayAppts
          .filter((apt) => !["completed", "cancelled", "no_show"].includes(apt.status))
          .map((apt, index) => {
            const time = new Date(apt.scheduled_at)
            return {
              id: apt.id,
              patient_id: apt.patient_id,
              patientName: apt.patient_name,
              time: time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
              scheduled_at: apt.scheduled_at,
              type: apt.type,
              status: apt.status,
              queueStatus: queueStatuses[index % queueStatuses.length] as QueueStatus,
              online_call_link: apt.online_call_link,
            }
          })
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

        setAppointments(queueData)
      } else {
        // Assistant
        const assistantAppts = todayAppts
          .filter((apt) => !["completed", "cancelled"].includes(apt.status))
          .map((apt, index) => {
            const time = new Date(apt.scheduled_at)
            
            // Auto-assign queue status based on position
            let queueStatus: QueueStatus | undefined = undefined
            if (apt.status === "no_show") {
              queueStatus = "no_show"
            } else if (index === 0) {
              queueStatus = "now"
            } else if (index === 1) {
              queueStatus = "next"
            } else {
              queueStatus = "waiting"
            }
            
            return {
              id: apt.id,
              patient_id: apt.patient_id,
              patientName: apt.patient_name,
              time: time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
              scheduled_at: apt.scheduled_at,
              type: apt.type,
              status: apt.status,
              queueStatus: queueStatus,
              online_call_link: apt.online_call_link,
            }
          })
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

        setAppointments(assistantAppts)
      }

      setLoading(false)
      return
    }

    // Non-demo mode - placeholder
    await new Promise((resolve) => setTimeout(resolve, 500))
    setAppointments([])
    setLoading(false)
  }

  // Unified Queue Management
  const updateQueueStatus = async (appointmentId: string, newStatus: QueueStatus | "scheduled") => {
    try {
      // Map queue status to appointment status
      let appointmentStatus: "scheduled" | "confirmed" | "in_progress" | "completed" | "no_show" | "cancelled" = "scheduled"
      
      if (newStatus === "in_progress") {
        appointmentStatus = "in_progress"
      } else if (newStatus === "no_show") {
        appointmentStatus = "no_show"
      } else if (newStatus === "scheduled") {
        appointmentStatus = "scheduled"
      }

      // Update appointment status via API (triggers patient activation if needed)
      if (newStatus === "in_progress") {
        await updateAppointmentStatus(appointmentId, appointmentStatus)
        showToast("Patient moved to Active", "success")
      } else if (newStatus !== "scheduled") {
        // For other statuses, just update locally for now
        await updateAppointmentStatus(appointmentId, appointmentStatus)
      }

      // Update local state
      // Remove appointment from list if it's marked as no_show
      // (completed and cancelled appointments shouldn't appear in today's queue to begin with)
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
    } catch (error) {
      showToast("Failed to update appointment status", "error")
    }
  }

  const _getQueueStatusColor = (status?: QueueStatus) => {
    switch (status) {
      case "now":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case "next":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "waiting":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "online_now":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      case "no_show":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      case "in_progress":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getIconColorClass = (index: number) => {
    if (index === 0) {
      return "text-green-600 dark:text-green-400"
    } else if (index === 1) {
      return "text-blue-600 dark:text-blue-400"
    }
    return "text-gray-400 dark:text-gray-500"
  }

  const getIconBackgroundClass = (index: number) => {
    if (index === 0) {
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    } else if (index === 1) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
  }

  // Drag and Drop Handlers (for assistants)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const draggedItem = appointments[draggedIndex]
    const targetItem = appointments[dropIndex]
    
    // Calculate new scheduled_at time based on target position
    // Use the target appointment's time as reference, or calculate from today's start
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get the target appointment's scheduled time
    const targetTime = new Date(targetItem.scheduled_at)
    
    // Calculate new time: if moving forward, use target's time; if moving backward, use target's time minus duration
    let newScheduledAt: string
    const _draggedTime = new Date(draggedItem.scheduled_at)
    const durationMinutes = 30 // Default duration
    
    if (draggedIndex < dropIndex) {
      // Moving forward: place after target
      newScheduledAt = new Date(targetTime.getTime() + durationMinutes * 60 * 1000).toISOString()
    } else {
      // Moving backward: place at target's time
      newScheduledAt = targetTime.toISOString()
    }
    
    // Ensure we're still on the same day
    const newDate = new Date(newScheduledAt)
    if (newDate.toDateString() !== today.toDateString()) {
      // Keep it on the same day, just adjust the time
      const hours = targetTime.getHours()
      const minutes = draggedIndex < dropIndex ? targetTime.getMinutes() + durationMinutes : targetTime.getMinutes()
      newDate.setHours(hours, minutes, 0, 0)
      newScheduledAt = newDate.toISOString()
    }
    
    const newEndAt = new Date(new Date(newScheduledAt).getTime() + durationMinutes * 60 * 1000).toISOString()

    try {
      // Reschedule the dragged appointment
      await updateAppointmentTime(
        draggedItem.id,
        newScheduledAt,
        newEndAt,
        {
          rescheduledBy: currentUser.id,
          rescheduledByRole: currentUser.role,
          rescheduledByName: currentUser.full_name,
          reason: "Reorganized via drag-and-drop in Today's Appointments widget",
        }
      )

      // Refresh appointments to get updated data
      await fetchDashboardData()
      
      showToast(`Appointment rescheduled to ${new Date(newScheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`, "success")
    } catch (error) {
      console.error("Failed to reschedule appointment:", error)
      showToast("Failed to reschedule appointment", "error")
      // Revert to original order on error
      setDraggedIndex(null)
      setDragOverIndex(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleMarkDone = async (appointmentId: string) => {
    try {
      // Update appointment status to completed (triggers patient activation)
      await updateAppointmentStatus(appointmentId, "completed")
      showToast("Appointment completed. Patient moved to Active", "success")
      // Remove from list
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
    } catch (error) {
      showToast("Failed to complete appointment", "error")
    }
  }

  const _getGreeting = () => {
    return role === "doctor" ? "Welcome back, Doctor!" : "Welcome back, Assistant!"
  }

  const getTimeDisplay = (scheduledAt: string) => {
    const now = new Date()
    const scheduled = new Date(scheduledAt)
    const diffMs = scheduled.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    // If less than 6 hours away, show "in X hours" or "X hours ago"
    if (Math.abs(diffHours) < 6) {
      if (diffHours < 0) {
        const hoursAgo = Math.abs(Math.round(diffHours * 10) / 10) // Round to 1 decimal
        if (hoursAgo < 1) {
          const minsAgo = Math.abs(Math.round(diffMs / 60000))
          return minsAgo === 0 ? "due now" : `${minsAgo}m ago`
        }
        return `${hoursAgo}h ago`
      } else if (diffHours === 0) {
        return "due now"
      } else {
        const hoursUntil = Math.round(diffHours * 10) / 10 // Round to 1 decimal
        if (hoursUntil < 1) {
          const minsUntil = Math.round(diffMs / 60000)
          return `in ${minsUntil}m`
        }
        return `in ${hoursUntil}h`
      }
    }

    // If more than 6 hours away, show the actual time
    return scheduled.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const handleNoShowClick = (appointmentId: string) => {
    setAppointmentToMarkNoShow(appointmentId)
    setShowNoShowModal(true)
  }

  const handleNoShowConfirm = async () => {
    if (!appointmentToMarkNoShow) return

    setIsMarkingNoShow(true)
    try {
      await updateQueueStatus(appointmentToMarkNoShow, "no_show")
      showToast("Appointment marked as no show", "success")
      setShowNoShowModal(false)
      setAppointmentToMarkNoShow(null)
    } catch (error) {
      showToast("Failed to mark appointment as no show", "error")
    } finally {
      setIsMarkingNoShow(false)
    }
  }

  const handleNoShowModalClose = () => {
    if (!isMarkingNoShow) {
      setShowNoShowModal(false)
      setAppointmentToMarkNoShow(null)
    }
  }

  const handleMarkArrived = async () => {
    if (!selectedAppointment) return
    setMarkingArrived(selectedAppointment.id)
    try {
      await updateAppointmentStatus(selectedAppointment.id, "arrived")
      showToast("Patient marked as arrived", "success")
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, status: "arrived" } : apt
        )
      )
      setShowArrivedModal(false)
    } catch (error) {
      showToast("Failed to mark patient as arrived", "error")
    } finally {
      setMarkingArrived(null)
    }
  }

  const handleUnmarkArrived = async () => {
    if (!selectedAppointment) return
    setMarkingArrived(selectedAppointment.id)
    try {
      // Revert status to scheduled
      await updateAppointmentStatus(selectedAppointment.id, "scheduled")
      showToast("Arrived status removed", "success")
      
      // Update local state
      setAppointments((prev) =>
        prev.map((apt) => {
          if (apt.id === selectedAppointment.id) {
            return { ...apt, status: "scheduled" }
          }
          return apt
        })
      )
      setShowUnmarkArrivedModal(false)
    } catch (error) {
      showToast("Failed to unmark patient as arrived", "error")
    } finally {
      setMarkingArrived(null)
    }
  }

  const openCreateInvoiceDrawer = (apt: DashboardAppointment) => {
    setSelectedAppointment(apt)
    setShowCreateInvoiceDrawer(true)
  }

  const handleCreateInvoiceSuccess = async () => {
    setShowCreateInvoiceDrawer(false)
    setSelectedAppointment(null)
    await fetchDashboardData()
    if (currentClinic) await loadPaymentStatus()
  }

  const handleUnmarkPaid = async () => {
    if (!selectedAppointment) return
    
    setMarkingPaid(selectedAppointment.id)
    try {
      // Get invoice for this appointment
      const invoice = await getInvoiceByAppointmentId(selectedAppointment.id)
      if (!invoice) {
        showToast("Could not find invoice to reverse", "error")
        return
      }

      // Mark invoice as unpaid (this will also handle payment removal in the backend)
      await markInvoiceUnpaid(invoice.id)
      
      showToast("Payment record removed", "success")
      setPaidAppointments((prev) => {
        const next = new Set(prev)
        next.delete(selectedAppointment.id)
        return next
      })
      setShowUnmarkPaidModal(false)
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error("Failed to reverse payment:", error)
      showToast("Failed to remove payment record", "error")
    } finally {
      setMarkingPaid(null)
    }
  }

  return (
    <div className="page-content">
      <PageHeader title="Dashboard" />

      {/* Appointments Section */}
      {role === "doctor" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Now Queue</h2>
            <Link href="/appointments">
              <Button variant="ghost" className="text-[11px] font-bold tracking-wider -mr-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                view all
                <RiArrowRightLine className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <WidgetSkeleton rows={5} />
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((apt, index) => {
                  const isNow = index === 0
                  const isNext = index === 1
                  const badgeVariant = isNow ? "success" : isNext ? "default" : "neutral"
                  const badgeText = isNow ? "now" : isNext ? "next" : null
                  
                  return (
                  <Link
                    key={apt.id}
                    href={`/patients/${apt.patient_id}`}
                    className="widget-row cursor-pointer"
                  >
                    <div className="widget-content-stack">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleMarkDone(apt.id)
                        }}
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all group/done ${getIconBackgroundClass(index)} hover:bg-green-500 hover:text-white dark:hover:bg-green-600 cursor-pointer`}
                        title="Mark as Done"
                      >
                        <div className="group-hover/done:hidden">
                          <RiUserLine className={`size-5 ${getIconColorClass(index)}`} />
                        </div>
                        <div className="hidden group-hover/done:block">
                          <RiCheckLine className="size-6" />
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {apt.patientName}
                          </p>
                          {(isNow || isNext) ? (
                            <Badge
                              variant={badgeVariant}
                              className="h-4 px-1.5 text-[10px] font-bold uppercase tracking-wider"
                            >
                              {badgeText}
                            </Badge>
                          ) : (
                            <span className="shrink-0 text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm lowercase">
                              {getTimeDisplay(apt.scheduled_at)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                            {apt.type}
                          </p>
                        </div>
                      </div>
                    </div>

                    {apt.online_call_link ? (
                      <div className="flex items-center gap-1.5 ml-4 shrink-0">
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-primary-widget shadow-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.open(apt.online_call_link, "_blank")
                          }}
                        >
                          join call
                        </Button>
                      </div>
                    ) : null}
                  </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                <RiCalendarLine className="mx-auto size-12 text-gray-400" />
                <p className="mt-2 text-sm">No appointments in queue</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Today&apos;s Appointments</h2>
            <Link href="/appointments">
              <Button variant="ghost" className="text-[11px] font-bold tracking-wider -mr-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                view all
                <RiArrowRightLine className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <WidgetSkeleton rows={5} />
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((apt, index) => {
                  const isNow = index === 0
                  const isNext = index === 1
                  const badgeVariant = isNow ? "success" : isNext ? "default" : "neutral"
                  const badgeText = isNow ? "now" : isNext ? "next" : null
                  
                  const isBusy = markingArrived === apt.id || markingPaid === apt.id

                  return (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`widget-row cursor-move relative ${
                      draggedIndex === index
                        ? "opacity-50 bg-primary-50/30 dark:bg-primary-900/10"
                        : dragOverIndex === index
                        ? "bg-primary-50/50 dark:bg-primary-900/20"
                        : ""
                    } ${isBusy ? "opacity-60" : ""}`}
                  >
                    {isBusy && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/40 dark:bg-black/20">
                        <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400" />
                      </div>
                    )}
                    <div className="widget-content-stack">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${getIconBackgroundClass(index)}`}>
                        <RiMenuLine className={`size-4 ${getIconColorClass(index)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {apt.patientName}
                          </p>
                          {(isNow || isNext) ? (
                            <Badge
                              variant={badgeVariant}
                              className="h-3.5 px-1 text-[10px] font-bold uppercase tracking-wider"
                            >
                              {badgeText}
                            </Badge>
                          ) : (
                            <span className="shrink-0 text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm lowercase">
                              {getTimeDisplay(apt.scheduled_at)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                            {apt.type}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-1.5 ml-2 sm:ml-4 shrink-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        {apt.queueStatus === "no_show" && (
                          <Badge
                            variant="error"
                            className="h-3.5 px-1 text-[10px] font-bold uppercase tracking-wider shrink-0"
                          >
                            no show
                          </Badge>
                        )}
                        {apt.status === "arrived" && (
                          <Badge
                            variant="success"
                            className="h-3.5 px-1 text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                              setShowUnmarkArrivedModal(true);
                            }}
                            title="Click to unmark arrived"
                          >
                            arrived
                          </Badge>
                        )}
                        {paidAppointments.has(apt.id) && (
                          <Badge
                            variant="success"
                            className="h-3.5 px-1 text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                              setShowUnmarkPaidModal(true);
                            }}
                            title="Click to unmark paid"
                          >
                            paid
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(apt.status === "scheduled" || apt.status === "confirmed" || apt.status === "in_progress") && (
                          <Button
                            variant="secondary"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedAppointment(apt);
                              setShowArrivedModal(true); 
                            }}
                            disabled={markingArrived === apt.id}
                            className="btn-secondary-widget text-green-600 hover:text-green-700 hover:bg-green-50 border-green-100 shrink-0 whitespace-nowrap"
                            title="Mark as Arrived"
                          >
                            <RiCheckboxCircleLine className="size-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">arrived</span>
                          </Button>
                        )}
                        {!paidAppointments.has(apt.id) && apt.status === "arrived" && (
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              openCreateInvoiceDrawer(apt)
                            }}
                            disabled={markingPaid === apt.id || markingArrived === apt.id}
                            className="btn-secondary-widget text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100 shrink-0 whitespace-nowrap"
                            title="Create invoice"
                          >
                            <RiMoneyDollarCircleLine className="size-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">create invoice</span>
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleNoShowClick(apt.id); 
                          }}
                          className="btn-secondary-widget text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 shrink-0 whitespace-nowrap"
                          title="Mark as No Show"
                        >
                          <RiCloseLine className="size-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">no show</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                <RiCalendarLine className="mx-auto size-12 text-gray-400" />
                <p className="mt-2 text-sm">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Show Confirmation Modal */}
      <ConfirmationModal
        isOpen={showNoShowModal}
        onClose={handleNoShowModalClose}
        onConfirm={handleNoShowConfirm}
        title="Mark as No Show"
        description="Are you sure you want to cancel this appointment and mark it as no show? This action will update the appointment status."
        confirmText="Yes, Mark as No Show"
        cancelText="Cancel"
        variant="danger"
        isLoading={isMarkingNoShow}
      />

      <ConfirmationModal
        isOpen={showArrivedModal}
        onClose={() => setShowArrivedModal(false)}
        onConfirm={handleMarkArrived}
        title="Mark as Arrived"
        description={`Mark ${selectedAppointment?.patientName} as arrived?`}
        confirmText="Confirm Arrival"
        cancelText="Cancel"
        variant="success"
        isLoading={!!markingArrived}
      />

      <ConfirmationModal
        isOpen={showUnmarkArrivedModal}
        onClose={() => setShowUnmarkArrivedModal(false)}
        onConfirm={handleUnmarkArrived}
        title="Undo Arrival"
        description={`Are you sure you want to un-mark ${selectedAppointment?.patientName} as arrived? Status will return to scheduled.`}
        confirmText="Yes, Undo"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!markingArrived}
      />

      <InvoiceDrawer
        open={showCreateInvoiceDrawer}
        onOpenChange={(open) => {
          setShowCreateInvoiceDrawer(open)
          if (!open) setSelectedAppointment(null)
        }}
        mode="invoice-and-pay"
        invoice={null}
        patientId={selectedAppointment?.patient_id}
        patientAppointments={selectedAppointment ? buildCreateInvoiceAppointments(selectedAppointment) : []}
        defaultAppointmentId={selectedAppointment?.id}
        onSuccess={handleCreateInvoiceSuccess}
      />

      <ConfirmationModal
        isOpen={showUnmarkPaidModal}
        onClose={() => setShowUnmarkPaidModal(false)}
        onConfirm={handleUnmarkPaid}
        title="Undo Payment"
        description={`Are you sure you want to delete the payment record for ${selectedAppointment?.patientName}?`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!markingPaid}
      />
    </div>
  )
}
