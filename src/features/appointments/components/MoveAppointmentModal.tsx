"use client"

import { Button } from "@/components/Button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { formatSlotDateTime } from "../utils/slotFormatters"

interface MoveAppointmentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  patientName: string
  currentTime: string
  newTime: string
  isLoading?: boolean
}

export function MoveAppointmentModal({
  open,
  onClose,
  onConfirm,
  patientName,
  currentTime,
  newTime,
  isLoading = false,
}: MoveAppointmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Appointment</DialogTitle>
          <DialogDescription>
            Move <span className="font-semibold text-gray-900 dark:text-gray-50">{patientName}</span>'s appointment?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">From:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {formatSlotDateTime(currentTime)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">To:</span>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {formatSlotDateTime(newTime)}
            </span>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Moving..." : "Move Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
