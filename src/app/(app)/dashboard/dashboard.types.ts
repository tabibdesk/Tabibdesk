import type { PatientAppointment } from "@/features/accounting/components/InvoiceDrawer"
import { mockData } from "@/data/mock/mock-data"

export type QueueStatus = "now" | "next" | "waiting" | "online_now" | "no_show" | "in_progress"

export interface DashboardAppointment {
  id: string
  patient_id: string
  patientName: string
  time: string
  scheduled_at: string
  type: string
  status: string
  queueStatus?: QueueStatus
  online_call_link?: string
}

export function buildCreateInvoiceAppointments(apt: DashboardAppointment): PatientAppointment[] {
  const full = mockData.appointments.find((a) => a.id === apt.id)
  if (!full) {
    return [
      {
        id: apt.id,
        patient_id: apt.patient_id,
        scheduled_at: apt.scheduled_at,
        type: apt.type || "Consultation",
        status: apt.status,
        doctor_id: null,
        clinic_id: null,
      },
    ]
  }
  return [
    {
      id: full.id,
      patient_id: full.patient_id,
      scheduled_at: full.scheduled_at,
      type: full.type,
      status: full.status,
      doctor_id: full.doctor_id ?? null,
      clinic_id: full.clinic_id ?? null,
    },
  ]
}
