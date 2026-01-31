import { mockData, mockDoctor } from "@/data/mock/mock-data"

export interface PatientAppointment {
  id: string
  patient_id: string
  scheduled_at: string
  type: string
  status: string
  doctor_id: string | null
  clinic_id: string | null
}

export function formatAptLabel(apt: PatientAppointment) {
  const d = new Date(apt.scheduled_at)
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  return `${date} ${time} • ${apt.type}`
}

export function getPatientName(patientId: string) {
  const patient = mockData.patients.find((p) => p.id === patientId)
  return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient"
}

export function getDoctorName(doctorId: string) {
  return mockDoctor?.full_name ?? "Dr. Unknown"
}

export function getAppointmentData(appointmentId: string) {
  const appointment = mockData.appointments.find((a) => a.id === appointmentId)
  if (!appointment) return null
  const date = new Date(appointment.scheduled_at)
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  }
}

/** All appointments for a patient at a clinic, in PatientAppointment shape, sorted by scheduled_at desc. */
export function getPatientAppointmentsForInvoice(
  patientId: string,
  clinicId: string
): PatientAppointment[] {
  return mockData.appointments
    .filter(
      (a) => (a.clinic_id || "") === clinicId && a.patient_id === patientId
    )
    .map((a) => ({
      id: a.id,
      patient_id: a.patient_id,
      scheduled_at: a.scheduled_at,
      type: a.type,
      status: a.status,
      doctor_id: a.doctor_id ?? null,
      clinic_id: a.clinic_id ?? null,
    }))
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))
}
