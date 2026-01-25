"use client"

import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import {
  RiCalendarLine,
  RiUserLine,
  RiEyeLine,
} from "@remixicon/react"
import Link from "next/link"
import type { AppointmentListItem } from "@/features/appointments/appointments.types"
import { getStatusBadgeVariant, getStatusLabel, formatAppointmentDate } from "@/features/appointments/appointments.utils"

interface ArchiveAppointmentsTableProps {
  appointments: AppointmentListItem[]
}

export function ArchiveAppointmentsTable({ appointments }: ArchiveAppointmentsTableProps) {
  const formatTime = (timeString: string) => {
    return timeString
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
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {appointment.type}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={getStatusBadgeVariant(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/patients/${appointment.patient_id}`}>
                      <Button variant="ghost" size="sm">
                        <RiUserLine className="mr-1 size-4" />
                        Open Patient
                      </Button>
                    </Link>
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
