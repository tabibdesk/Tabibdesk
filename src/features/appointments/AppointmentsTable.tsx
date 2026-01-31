"use client"

import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { Button } from "@/components/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuIconWrapper,
} from "@/components/Dropdown"
import {
  RiCalendarLine,
  RiMoreLine,
  RiCalendarEventLine,
  RiCloseLine,
  RiVideoLine,
  RiEyeLine,
  RiUserAddLine,
  RiHistoryLine,
} from "@remixicon/react"
import Link from "next/link"
import type { AppointmentListItem } from "./appointments.types"
import { getStatusBadgeVariant, getStatusLabel, formatAppointmentDate } from "./appointments.utils"

interface AppointmentsTableProps {
  appointments: AppointmentListItem[]
  onReschedule: (appointment: AppointmentListItem) => void
  onCancel: (appointmentId: string) => void
  onViewDetails: (appointment: AppointmentListItem) => void
  onFillSlot?: (appointment: AppointmentListItem) => void
}

export function AppointmentsTable({
  appointments,
  onReschedule,
  onCancel,
  onViewDetails,
  onFillSlot,
}: AppointmentsTableProps) {
  const formatTime = (timeString: string) => {
    return timeString
  }

  const canReschedule = (status: AppointmentListItem["status"]) => {
    return status === "scheduled" || status === "confirmed"
  }

  const canCancel = (status: AppointmentListItem["status"]) => {
    return status === "scheduled" || status === "confirmed"
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/patients/${appointment.patient_id}`}
                    className="font-medium text-gray-900 hover:text-primary-600 dark:text-gray-50 dark:hover:text-primary-400"
                  >
                    {appointment.patient_name}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <RiCalendarLine className="size-4 shrink-0" />
                    <span>
                      {formatAppointmentDate(appointment.appointment_date)} • {formatTime(appointment.appointment_time)}
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
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {appointment.type}
                </td>
                <td className="px-4 py-4">
                  <Badge color={getBadgeColor(getStatusBadgeVariant(appointment.status))} size="xs">
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <RiMoreLine className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onViewDetails(appointment)}>
                          <DropdownMenuIconWrapper className="mr-2">
                            <RiEyeLine className="size-4" />
                          </DropdownMenuIconWrapper>
                          View Details
                        </DropdownMenuItem>
                        {appointment.online_call_link && (
                          <DropdownMenuItem asChild>
                            <a
                              href={appointment.online_call_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <DropdownMenuIconWrapper className="mr-2">
                                <RiVideoLine className="size-4" />
                              </DropdownMenuIconWrapper>
                              Join Online Call
                            </a>
                          </DropdownMenuItem>
                        )}
                        {canReschedule(appointment.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                              <DropdownMenuIconWrapper className="mr-2">
                                <RiCalendarEventLine className="size-4" />
                              </DropdownMenuIconWrapper>
                              Reschedule
                            </DropdownMenuItem>
                          </>
                        )}
                        {canCancel(appointment.status) && (
                          <DropdownMenuItem
                            onClick={() => onCancel(appointment.id)}
                            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                          >
                            <DropdownMenuIconWrapper className="mr-2">
                              <RiCloseLine className="size-4" />
                            </DropdownMenuIconWrapper>
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {(appointment.status === "cancelled" || appointment.status === "no_show") && onFillSlot && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onFillSlot(appointment)}>
                              <DropdownMenuIconWrapper className="mr-2">
                                <RiUserAddLine className="size-4" />
                              </DropdownMenuIconWrapper>
                              Fill This Slot
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
