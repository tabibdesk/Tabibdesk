"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiCalendarLine, RiAddLine, RiTimeLine, RiUserLine } from "@remixicon/react"

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  scheduled_at: string
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
  type: string
  notes: string | null
  created_at: string
}

interface AppointmentsTabProps {
  appointments: Appointment[]
}

export function AppointmentsTab({ appointments }: AppointmentsTabProps) {
  // Sort appointments by date (newest first)
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  )

  // Separate upcoming and past appointments
  const now = new Date()
  const upcomingAppointments = sortedAppointments.filter(
    (apt) => new Date(apt.scheduled_at) > now && apt.status !== "cancelled"
  )
  const pastAppointments = sortedAppointments.filter(
    (apt) => new Date(apt.scheduled_at) <= now || apt.status === "cancelled"
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "cancelled":
        return <Badge variant="error">Cancelled</Badge>
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>
      case "no_show":
        return <Badge variant="error">No Show</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {appointments.length}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {upcomingAppointments.length}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">No Show</p>
                <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">
                  {appointments.filter((a) => a.status === "no_show").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiCalendarLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No appointments yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Upcoming Appointments
              </h3>
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-primary-600">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{appointment.type}</CardTitle>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <RiCalendarLine className="size-4" />
                            {new Date(appointment.scheduled_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <RiTimeLine className="size-4" />
                            {new Date(appointment.scheduled_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </CardHeader>
                  {appointment.notes && (
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Past Appointments
              </h3>
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{appointment.type}</CardTitle>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <RiCalendarLine className="size-4" />
                            {new Date(appointment.scheduled_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <RiTimeLine className="size-4" />
                            {new Date(appointment.scheduled_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </CardHeader>
                  {appointment.notes && (
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

