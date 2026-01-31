import type { Patient } from "@/components/shared/PatientSelector"

export interface AppBookableService {
  id: number
  title: string
  description: string
  duration_minutes: number
  app_clinic_id: string | null
  app_doctor_id: string | null
  app_appointment_type_name: string
  app_clinic_name: string | null
  app_doctor_name: string | null
}

export interface TimeSlot {
  starts_at: string
  ends_at: string
}

export interface AvailableDate {
  date: string
}

export interface PreSelectedSlot {
  clinicId: string
  doctorId: string
  startAt: string
  endAt: string
  appointmentType?: string
}

export interface WaitlistEntry {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  appointmentType?: string
  notes?: string
}

export type BookFlowStep = "patient" | "service" | "datetime" | "confirmation" | "success"

export interface BookAppointmentFlowProps {
  initialPatient?: Patient | null
  showBackButton?: boolean
  showTitle?: boolean
  showHeader?: boolean
  isEmbedded?: boolean
  preSelectedSlot?: PreSelectedSlot | null
  rescheduleAppointmentId?: string | null
  waitlistEntry?: WaitlistEntry | null
  clinicId?: string
  doctorId?: string
  onBookingComplete?: () => void
  onCancel?: () => void
}
