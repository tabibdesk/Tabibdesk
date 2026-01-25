"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useDemo } from "@/contexts/demo-context"
import { mockAppointments } from "@/data/mock/mock-data"
import { updateStatus as updateAppointmentStatus } from "@/features/appointments/appointments.api"
import { useToast } from "@/hooks/useToast"
import {
  RiCalendarLine,
  RiArrowRightLine,
  RiTimeZoneLine,
  RiRadioButtonLine,
  RiCheckboxCircleLine,
  RiWifiLine,
  RiMenuLine,
  RiCheckLine,
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

export default function DashboardPage() {
  const { currentUser } = useUserClinic()
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

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, role])

  // Debug: log when appointments change
  useEffect(() => {
    console.log("Dashboard appointments updated:", appointments.length)
  }, [appointments])

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
      setAppointments((prev) =>
        prev.map((apt) => {
          if (apt.id === appointmentId) {
            return {
              ...apt,
              queueStatus: newStatus === "scheduled" ? undefined : newStatus,
              status: newStatus === "scheduled" ? "scheduled" : newStatus === "no_show" ? "no_show" : apt.status,
            }
          }
          return apt
        })
      )
    } catch (error) {
      showToast("Failed to update appointment status", "error")
    }
  }

  const getQueueStatusColor = (status?: QueueStatus) => {
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

  const getQueueStatusIcon = (status?: QueueStatus) => {
    switch (status) {
      case "now":
        return <RiRadioButtonLine className="size-4 animate-pulse" />
      case "in_progress":
        return <RiCheckboxCircleLine className="size-4" />
      case "next":
        return <RiArrowRightLine className="size-4" />
      case "waiting":
        return <RiTimeZoneLine className="size-4" />
      case "online_now":
        return <RiWifiLine className="size-4" />
      default:
        return null
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

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newAppointments = [...appointments]
    const draggedItem = newAppointments[draggedIndex]

    newAppointments.splice(draggedIndex, 1)
    newAppointments.splice(dropIndex, 0, draggedItem)

    // Auto-assign queue status: first is "now", second is "next", rest are waiting or no_show
    const updatedAppointments = newAppointments.map((apt, index) => {
      if (apt.queueStatus === "no_show") {
        // Keep no_show status
        return apt
      }
      if (index === 0) {
        return { ...apt, queueStatus: "now" as QueueStatus }
      } else if (index === 1) {
        return { ...apt, queueStatus: "next" as QueueStatus }
      } else {
        return { ...apt, queueStatus: "waiting" as QueueStatus }
      }
    })

    setAppointments(updatedAppointments)
    setDraggedIndex(null)
    setDragOverIndex(null)
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

  const getGreeting = () => {
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

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      {/* Appointments Section */}
      {role === "doctor" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Now Queue</CardTitle>
              <Link href="/appointments">
                <Button variant="ghost" className="text-xs -ml-2 -mr-2 pr-2">
                  View All
                  <RiArrowRightLine className="ml-1 size-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
                ))}
              </div>
            ) : appointments.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {appointments.map((apt, index) => {
                  const isNow = index === 0
                  const isNext = index === 1
                  const badgeVariant = isNow ? "success" : isNext ? "default" : "neutral"
                  const badgeText = isNow ? "Now" : isNext ? "Next" : null
                  
                  return (
                  <div
                    key={apt.id}
                    className="widget-row"
                  >
                    {/* Status Accent Line */}
                    <div className={`widget-status-accent ${
                      isNow || apt.queueStatus === "online_now" ? "bg-green-500" :
                      isNext ? "bg-blue-500" :
                      "bg-gray-200 dark:bg-gray-700"
                    }`} />

                    <div className="widget-content-stack ml-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkDone(apt.id);
                        }}
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all group/done ${getIconBackgroundClass(index)} hover:bg-green-500 hover:text-white dark:hover:bg-green-600 cursor-pointer`}
                        title="Mark as Done"
                      >
                        <div className="group-hover/done:hidden">
                          <span className={getIconColorClass(index)}>
                            {getQueueStatusIcon(apt.queueStatus)}
                          </span>
                        </div>
                        <div className="hidden group-hover/done:block">
                          <RiCheckLine className="size-6" />
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {apt.patientName}
                          </p>
                          {(isNow || isNext) ? (
                            <Badge
                              variant={badgeVariant}
                              className="h-4 px-1.5 text-xs font-bold tracking-tighter"
                            >
                              {badgeText}
                            </Badge>
                          ) : (
                            <span className="shrink-0 text-xs font-bold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm">
                              {getTimeDisplay(apt.scheduled_at)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {apt.type}
                          </p>
                          {(apt.queueStatus === "online_now" || apt.queueStatus === "now") && (
                            <span className={`flex items-center gap-1 text-xs font-medium ${apt.queueStatus === "online_now" ? "text-purple-600 dark:text-purple-400" : "text-green-600 dark:text-green-400"}`}>
                              <span className={`size-1.5 rounded-full ${apt.queueStatus === "online_now" ? "bg-purple-500" : "bg-green-500"} animate-pulse`} />
                              live
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4">
                      {apt.online_call_link ? (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="btn-primary-widget"
                          onClick={() => window.open(apt.online_call_link, '_blank')}
                        >
                          join call
                        </Button>
                      ) : null}
                      <Link href={`/patients/${apt.patient_id}`}>
                        <Button variant="outline" size="sm" className="btn-secondary-widget">
                          open profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                <RiCalendarLine className="mx-auto size-12 text-gray-400" />
                <p className="mt-2 text-xs">No appointments in queue</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today&apos;s Appointments</CardTitle>
              <Link href="/appointments">
                <Button variant="ghost" className="text-xs -ml-2 -mr-2 pr-2">
                  View All
                  <RiArrowRightLine className="ml-1 size-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
                ))}
              </div>
            ) : appointments.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {appointments.map((apt, index) => {
                  const isNow = index === 0
                  const isNext = index === 1
                  const badgeVariant = isNow ? "success" : isNext ? "default" : "neutral"
                  const badgeText = isNow ? "Now" : isNext ? "Next" : null
                  
                  return (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`widget-row cursor-move ${
                      draggedIndex === index
                        ? "opacity-50 bg-primary-50/30 dark:bg-primary-900/10"
                        : dragOverIndex === index
                        ? "bg-primary-50/50 dark:bg-primary-900/20"
                        : ""
                    }`}
                  >
                    {/* Status Accent Line */}
                    <div className={`widget-status-accent ${
                      isNow || apt.queueStatus === "online_now" ? "bg-green-500" :
                      isNext ? "bg-blue-500" :
                      apt.queueStatus === "no_show" ? "bg-red-500" :
                      "bg-gray-200 dark:bg-gray-700"
                    }`} />

                    <div className="widget-content-stack ml-1">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${getIconBackgroundClass(index)}`}>
                        <RiMenuLine className={`size-4 ${getIconColorClass(index)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {apt.patientName}
                          </p>
                          {(isNow || isNext) ? (
                            <Badge
                              variant={badgeVariant}
                              className="h-3.5 px-1 text-xs font-bold tracking-tighter"
                            >
                              {badgeText}
                            </Badge>
                          ) : (
                            <span className="shrink-0 text-xs font-bold tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm">
                              {getTimeDisplay(apt.scheduled_at)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {apt.type}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4">
                      {apt.queueStatus === "no_show" && (
                        <Badge
                          variant="error"
                          className="h-3.5 px-1 text-xs font-bold tracking-tighter"
                        >
                          no show
                        </Badge>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleNoShowClick(apt.id); 
                        }}
                        className="btn-primary-widget"
                        title="Mark as No Show"
                      >
                        x no show
                      </Button>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                <RiCalendarLine className="mx-auto size-12 text-gray-400" />
                <p className="mt-2 text-xs">No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
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
    </div>
  )
}
