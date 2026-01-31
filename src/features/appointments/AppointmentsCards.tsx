"use client"

import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import {
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiPhoneLine,
  RiCheckLine,
  RiCloseLine,
  RiVideoLine,
  RiCalendarEventLine,
  RiUserAddLine,
  RiHistoryLine,
} from "@remixicon/react"
import Link from "next/link"
import type { AppointmentListItem } from "./appointments.types"
import { getStatusBadgeVariant, getStatusLabel } from "./appointments.utils"

interface AppointmentsCardsProps {
  appointments: AppointmentListItem[]
  onReschedule: (appointment: AppointmentListItem) => void
  onCancel: (appointmentId: string) => void
  onFillSlot?: (appointment: AppointmentListItem) => void
  /** When true, hide cancel/reschedule/fill-slot; profile openable only from patient name (e.g. archive tab). */
  readOnly?: boolean
}

export function AppointmentsCards({
  appointments,
  onReschedule,
  onCancel,
  onFillSlot,
  readOnly = false,
}: AppointmentsCardsProps) {
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => {
        const isSlotCard = appointment.status === "cancelled" || appointment.status === "no_show"

        if (isSlotCard) {
          return (
            <div
              key={appointment.id}
              className="card-surface flex items-center gap-4 px-5 py-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <RiCalendarLine className="size-5 text-gray-500 dark:text-gray-400" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {appointment.appointment_time}
                  </span>
                  <Badge color={getBadgeColor(getStatusBadgeVariant(appointment.status))} size="xs">
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1 capitalize">{getStatusLabel(appointment.status)}</span>
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <RiTimeLine className="size-4 shrink-0" />
                  <span>{appointment.duration_minutes} min</span>
                  {appointment.type && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{appointment.type}</span>
                    </>
                  )}
                </div>
              </div>
              {!readOnly && onFillSlot && (
                <div className="shrink-0">
                  <Button
                    variant="primary"
                    className="btn-card-action"
                    onClick={() => onFillSlot(appointment)}
                  >
                    <RiUserAddLine className="mr-1 size-4" />
                    Fill Slot
                  </Button>
                </div>
              )}
            </div>
          )
        }

        return (
        <Card key={appointment.id} className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/patients/${appointment.patient_id}`}>
                  <CardTitle className="cursor-pointer text-lg text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    {appointment.patient_name}
                  </CardTitle>
                </Link>
                <CardDescription className="mt-1">
                  <Badge color={getBadgeColor(getStatusBadgeVariant(appointment.status))} size="xs">
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1 capitalize">{getStatusLabel(appointment.status)}</span>
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
              {appointment.rescheduled && (
                <Badge 
                  color="amber"
                  size="xs"
                  title={`Rescheduled ${appointment.reschedule_count || 1} time${(appointment.reschedule_count || 1) > 1 ? 's' : ''}`}
                >
                  <RiHistoryLine className="size-2.5 mr-0.5" />
                  rescheduled
                </Badge>
              )}
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
            {!readOnly && (
              <div className="mt-4 flex gap-2">
                {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <>
                      <Button
                        variant="primary"
                        className="btn-card-action flex-1"
                        onClick={() => onReschedule(appointment)}
                      >
                        <RiCalendarEventLine className="mr-1 size-4" />
                        Reschedule
                      </Button>
                      <Button
                        variant="ghost"
                        className="btn-card-action text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => onCancel(appointment.id)}
                      >
                        <RiCloseLine className="mr-1 size-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {appointment.status === "completed" && (
                    <Button variant="secondary" className="btn-card-action flex-1" disabled>
                      <RiCheckLine className="mr-1 size-4" />
                      Completed
                    </Button>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )})}
    </div>
  )
}
