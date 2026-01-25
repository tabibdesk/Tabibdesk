"use client"

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/Drawer"
import { BookAppointmentFlow } from "@/components/appointments/BookAppointmentFlow"

interface PreSelectedSlot {
  clinicId: string
  doctorId: string
  startAt: string
  endAt: string
  appointmentType?: string
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
}

interface BookAppointmentDrawerProps {
  open: boolean
  onClose: () => void
  onBookingComplete?: () => void
  preSelectedSlot?: PreSelectedSlot | null
  initialPatient?: Patient | null
  rescheduleAppointmentId?: string | null
  clinicId?: string
  doctorId?: string
}

export function BookAppointmentDrawer({
  open,
  onClose,
  onBookingComplete,
  preSelectedSlot = null,
  initialPatient = null,
  rescheduleAppointmentId = null,
  clinicId,
  doctorId,
}: BookAppointmentDrawerProps) {
  const handleBookingComplete = () => {
    if (onBookingComplete) {
      onBookingComplete()
    }
    onClose()
  }

  const title = preSelectedSlot ? "Fill Slot" : "Reschedule Appointment"
  const description = preSelectedSlot 
    ? "Select patient and service for this time slot"
    : "Select a new date and time for this appointment"

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent side="right" className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <BookAppointmentFlow
            showBackButton={false}
            showTitle={false}
            showHeader={false}
            isEmbedded={true}
            initialPatient={initialPatient}
            preSelectedSlot={preSelectedSlot}
            rescheduleAppointmentId={rescheduleAppointmentId}
            clinicId={clinicId}
            doctorId={doctorId}
            onCancel={onClose}
            onBookingComplete={handleBookingComplete}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
