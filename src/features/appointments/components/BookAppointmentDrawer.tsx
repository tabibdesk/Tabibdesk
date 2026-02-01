"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
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

interface WaitlistEntry {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  appointmentType?: string
  notes?: string
}

interface BookAppointmentDrawerProps {
  open: boolean
  onClose: () => void
  onBookingComplete?: () => void
  preSelectedSlot?: PreSelectedSlot | null
  initialPatient?: Patient | null
  rescheduleAppointmentId?: string | null
  waitlistEntry?: WaitlistEntry | null
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
  waitlistEntry = null,
  clinicId,
  doctorId,
}: BookAppointmentDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const handleBookingComplete = () => {
    if (onBookingComplete) {
      onBookingComplete()
    }
    onClose()
  }

  const title = preSelectedSlot ? t.appointments.fillSlot : waitlistEntry ? t.appointments.bookFromWaitlist : t.appointments.rescheduleAppointment

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
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
            waitlistEntry={waitlistEntry}
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
