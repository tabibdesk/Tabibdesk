"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { Button } from "@/components/Button"
import { RiAlertLine } from "@remixicon/react"

interface CancelAppointmentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  patientName?: string
  appointmentTime?: string
  isLoading?: boolean
}

export function CancelAppointmentModal({
  open,
  onClose,
  onConfirm,
  patientName,
  appointmentTime,
  isLoading = false,
}: CancelAppointmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <RiAlertLine className="size-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {patientName && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Patient: <span className="font-semibold">{patientName}</span>
              </p>
              {appointmentTime && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Time: {appointmentTime}
                </p>
              )}
            </div>
          )}
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            This action cannot be undone. The appointment will be marked as cancelled.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isLoading}>
              Keep Appointment
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
