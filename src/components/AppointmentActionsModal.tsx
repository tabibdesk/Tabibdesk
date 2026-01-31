"use client"

import { Button } from "@/components/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import {
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiStethoscopeLine,
  RiPhoneLine,
  RiCalendarEventLine,
  RiCloseLine,
  RiCheckLine,
  RiVideoLine,
} from "@remixicon/react"

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: string
  type: string
  online_call_link?: string
}

interface AppointmentActionsModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onReschedule: () => void
  onCancel: () => void
}

export function AppointmentActionsModal({
  isOpen,
  onClose,
  appointment,
  onReschedule,
  onCancel,
}: AppointmentActionsModalProps) {
  if (!appointment) return null

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const canReschedule = appointment.status === "scheduled" || appointment.status === "confirmed"
  const canCancel = appointment.status === "scheduled" || appointment.status === "confirmed"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View and manage this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge color={getBadgeColor(getStatusColor(appointment.status))} size="xs">
              <span className="flex items-center gap-1">
                {getStatusIcon(appointment.status)}
                <span className="capitalize">{appointment.status}</span>
              </span>
            </Badge>
          </div>

          {/* Appointment Info */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-50">
              <RiUserLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Patient</div>
                <div className="font-medium">{appointment.patient_name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-50">
              <RiStethoscopeLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                <div className="font-medium">{appointment.type}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-50">
              <RiCalendarLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Date</div>
                <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-50">
              <RiTimeLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                <div className="font-medium">
                  {appointment.appointment_time} ({appointment.duration_minutes} min)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-50">
              <RiPhoneLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
                <div className="font-medium">{appointment.patient_phone}</div>
              </div>
            </div>

            {appointment.online_call_link && (
              <div className="flex items-center gap-3">
                <RiVideoLine className="size-5 shrink-0 text-primary-600 dark:text-primary-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Online Call</div>
                  <a
                    href={appointment.online_call_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canReschedule && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  onClose()
                  onReschedule()
                }}
              >
                <RiCalendarEventLine className="mr-2 size-4" />
                Reschedule
              </Button>
            )}
            {canCancel && (
              <Button
                variant="secondary"
                className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => {
                  onClose()
                  onCancel()
                }}
              >
                <RiCloseLine className="mr-2 size-4" />
                Cancel
              </Button>
            )}
            {!canReschedule && !canCancel && (
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

