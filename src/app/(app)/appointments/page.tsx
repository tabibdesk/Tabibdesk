"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  RiSearchLine,
  RiAddLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiPhoneLine,
  RiCheckLine,
  RiCloseLine,
  RiListCheck,
  RiVideoLine,
  RiCalendarEventLine,
} from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { mockData } from "@/data/mock/mock-data"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { RescheduleModal } from "@/components/RescheduleModal"
import { AppointmentActionsModal } from "@/components/AppointmentActionsModal"

// Lazy load the calendar component
const AppointmentCalendar = lazy(() => import("@/components/AppointmentCalendar").then(mod => ({ default: mod.AppointmentCalendar })))

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: "scheduled" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show"
  type: string
  online_call_link?: string
}

export default function AppointmentsPage() {
  const { isDemoMode } = useDemo()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show">("all")
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">("upcoming")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [showActionsModal, setShowActionsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode])

  useEffect(() => {
    let filtered = appointments

    // Filter by time (upcoming/past)
    const now = new Date()
    if (timeFilter === "upcoming") {
      filtered = filtered.filter((apt) => {
        const appointmentDateTime = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
        return appointmentDateTime >= now
      })
    } else if (timeFilter === "past") {
      filtered = filtered.filter((apt) => {
        const appointmentDateTime = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
        return appointmentDateTime < now
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.patient_phone.includes(searchTerm) ||
          apt.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus)
    }

    // Sort by date and time (earliest first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
      return dateA.getTime() - dateB.getTime()
    })

    setFilteredAppointments(filtered)
  }, [searchTerm, appointments, filterStatus, timeFilter])

  const fetchAppointments = async () => {
    setLoading(true)

    if (isDemoMode) {
      // Transform mock appointments to match the expected format
      const transformedAppointments = mockData.appointments.map((apt) => {
        const date = new Date(apt.scheduled_at)
        const patient = mockData.patients.find((p) => p.id === apt.patient_id)
        
        return {
          id: apt.id,
          patient_id: apt.patient_id,
          patient_name: apt.patient_name,
          patient_phone: patient?.phone || "",
          appointment_date: date.toISOString().split("T")[0],
          appointment_time: date.toTimeString().slice(0, 5),
          duration_minutes: 30, // Default duration
          status: apt.status,
          type: apt.type,
        }
      })
      
      setAppointments(transformedAppointments)
      setLoading(false)
      return
    }

    // TODO: Fetch from Supabase when integrated
    setAppointments([])
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "confirmed":
        return "default"
      case "in_progress":
        return "warning"
      case "completed":
        return "success"
      case "cancelled":
        return "error"
      case "no_show":
        return "error"
      default:
        return "neutral"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <RiCheckLine className="size-4" />
      case "cancelled":
        return <RiCloseLine className="size-4" />
      default:
        return <RiCalendarLine className="size-4" />
    }
  }

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId)
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    setIsCancelling(true)

    try {
      if (isDemoMode) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Update appointment status in state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentToCancel ? { ...apt, status: "cancelled" as const } : apt
          )
        )
      } else {
        // TODO: Actual API call to cancel appointment
        // await cancelAppointment(appointmentToCancel)
      }

      setShowCancelModal(false)
      setAppointmentToCancel(null)
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCancelModalClose = () => {
    if (!isCancelling) {
      setShowCancelModal(false)
      setAppointmentToCancel(null)
    }
  }

  const handleRescheduleClick = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment)
    setShowRescheduleModal(true)
  }

  const handleRescheduleConfirm = async (appointmentId: string, newDate: string, newTime: string) => {
    setIsRescheduling(true)

    try {
      if (isDemoMode) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Update appointment in state and propagate to mock data
        setAppointments((prev) => {
          const updated = prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, appointment_date: newDate, appointment_time: newTime }
              : apt
          )
          
          // Update mock data source
          const appointmentIndex = mockData.appointments.findIndex(a => a.id === appointmentId)
          if (appointmentIndex !== -1) {
            mockData.appointments[appointmentIndex] = {
              ...mockData.appointments[appointmentIndex],
              appointment_date: newDate,
              appointment_time: newTime
            }
          }
          
          return updated
        })
      } else {
        // TODO: Actual API call to reschedule appointment
        // await rescheduleAppointment(appointmentId, newDate, newTime)
      }

      setShowRescheduleModal(false)
      setAppointmentToReschedule(null)
    } catch (error) {
      console.error("Failed to reschedule appointment:", error)
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleRescheduleModalClose = () => {
    if (!isRescheduling) {
      setShowRescheduleModal(false)
      setAppointmentToReschedule(null)
    }
  }

  const displayAppointments = filteredAppointments

  return (
    <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Appointments</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {appointments.length} total appointments
          </p>
        </div>
        {/* View Mode Toggle - Centered */}
        <div className="flex justify-center lg:flex-1">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              }`}
            >
              <RiListCheck className="size-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === "calendar"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              }`}
            >
              <RiCalendarLine className="size-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
        {/* Add New Appointment Button - Right */}
        <div className="flex justify-end lg:flex-1">
          <Link href="/appointments/book">
            <Button>
              <RiAddLine className="mr-2 size-4" />
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Conditional Rendering Based on View Mode */}
      {viewMode === "calendar" ? (
        /* Calendar View */
        <Suspense fallback={
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-800 dark:border-t-primary-400"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading calendar...</p>
            </div>
          </div>
        }>
          <AppointmentCalendar 
            appointments={displayAppointments.map((apt) => ({
              id: apt.id,
              patient_name: apt.patient_name,
              patient_phone: apt.patient_phone,
              date: apt.appointment_date,
              time: apt.appointment_time,
              status: apt.status as "scheduled" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show",
              type: apt.type,
            }))}
            onAppointmentClick={(calendarAppointment) => {
              const fullAppointment = appointments.find(apt => apt.id === calendarAppointment.id)
              if (fullAppointment) {
                setSelectedAppointment(fullAppointment)
                setShowActionsModal(true)
              }
            }}
          />
        </Suspense>
      ) : (
        /* List View */
        <>
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as "upcoming" | "past" | "all")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All Appointments</option>
            </select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Appointment Cards Grid */}
              {displayAppointments.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="transition-shadow hover:shadow-lg"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link href={`/patients/${appointment.patient_id}`}>
                              <CardTitle className="cursor-pointer text-lg text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                                {appointment.patient_name}
                              </CardTitle>
                            </Link>
                            <CardDescription className="mt-1">
                              <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1 capitalize">{appointment.status}</span>
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <RiCalendarLine className="size-4 shrink-0" />
                          <span>
                            {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <RiTimeLine className="size-4 shrink-0" />
                          <span>
                            {appointment.appointment_time} ({appointment.duration_minutes} min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <RiUserLine className="size-4 shrink-0" />
                          <span>{appointment.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <RiPhoneLine className="size-4 shrink-0" />
                          <span>{appointment.patient_phone}</span>
                        </div>
                        {appointment.online_call_link && (
                          <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                            <RiVideoLine className="size-4 shrink-0" />
                            <a 
                              href={appointment.online_call_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Join Online Call
                            </a>
                          </div>
                        )}
                        <div className="mt-4 flex gap-2">
                          {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                            <>
                              <Button
                                variant="primary"
                                className="flex-1 text-sm"
                                onClick={() => handleRescheduleClick(appointment)}
                              >
                                <RiCalendarEventLine className="mr-1 size-4" />
                                Reschedule
                              </Button>
                              <Button
                                variant="ghost"
                                className="text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => handleCancelClick(appointment.id)}
                              >
                                <RiCloseLine className="mr-1 size-4" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === "completed" && (
                            <Button variant="secondary" className="flex-1 text-sm" disabled>
                              <RiCheckLine className="mr-1 size-4" />
                              Completed
                            </Button>
                          )}
                          {appointment.status === "cancelled" && (
                            <Button variant="ghost" className="flex-1 text-sm text-gray-500" disabled>
                              <RiCloseLine className="mr-1 size-4" />
                              Cancelled
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <RiCalendarLine className="mx-auto size-12 text-gray-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      {searchTerm || filterStatus !== "all"
                        ? "No appointments found matching your filters."
                        : "No appointments scheduled yet."}
                    </p>
                    {!searchTerm && filterStatus === "all" && (
                      <Link href="/appointments/book">
                        <Button className="mt-4">
                          <RiAddLine className="mr-2 size-4" />
                          Schedule First Appointment
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelModalClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        variant="danger"
        isLoading={isCancelling}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={handleRescheduleModalClose}
        onConfirm={handleRescheduleConfirm}
        appointment={appointmentToReschedule}
        isLoading={isRescheduling}
      />

      {/* Appointment Actions Modal (from calendar) */}
      <AppointmentActionsModal
        isOpen={showActionsModal}
        onClose={() => {
          setShowActionsModal(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onReschedule={() => {
          if (selectedAppointment) {
            handleRescheduleClick(selectedAppointment)
          }
        }}
        onCancel={() => {
          if (selectedAppointment) {
            handleCancelClick(selectedAppointment.id)
          }
        }}
      />
    </div>
  )
}
