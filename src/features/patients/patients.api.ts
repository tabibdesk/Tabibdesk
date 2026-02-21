import * as patientsApi from "@/api/patients.api"
import type { CreatePatientInput, ListPatientsParams, ListPatientsResponse, Patient, PatientListItem } from "./patients.types"
import { mockData } from "@/data/mock/mock-data"

/**
 * Wrapper around the API layer for backward compatibility
 * This ensures UI components can continue using the existing interface
 */
export async function listPatients(params: ListPatientsParams): Promise<ListPatientsResponse> {
  const { page, pageSize, query, clinicId, status, firstVisitFrom, firstVisitTo } = params

  // Use the new API layer
  const response = await patientsApi.list({
    page,
    pageSize,
    query,
    clinicId,
    status,
    firstVisitFrom,
    firstVisitTo,
  })

  // Enrich with lastAppointmentDate for PatientListItem
  const patientsWithAppointments: PatientListItem[] = response.patients.map((patient) => {
    const patientAppointments = mockData.appointments
      .filter((apt) => apt.patient_id === patient.id)
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())

    const lastAppointment = patientAppointments[0] || null
    const lastAppointmentDate = lastAppointment ? lastAppointment.scheduled_at : null

    return {
      ...patient,
      lastAppointmentDate,
    }
  })

  // Sort by last appointment date (most recent first), then by name
  patientsWithAppointments.sort((a, b) => {
    if (a.lastAppointmentDate && b.lastAppointmentDate) {
      return new Date(b.lastAppointmentDate).getTime() - new Date(a.lastAppointmentDate).getTime()
    }
    if (a.lastAppointmentDate) return -1
    if (b.lastAppointmentDate) return 1
    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
  })

  return {
    patients: patientsWithAppointments,
    total: response.total,
    page: response.page,
    pageSize: response.pageSize,
    hasMore: response.hasMore,
  }
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  return patientsApi.create({
    firstName: input.first_name,
    lastName: input.last_name,
    phone: input.phone,
    email: input.email,
    gender: input.gender,
    source: input.source,
    sourceOther: input.source_other,
    address: input.address,
    complaint: input.complaint,
    socialStatus: input.social_status,
  })
}

export function getPatientById(_id: string): Patient | null {
  // This is synchronous for backward compatibility
  // In real implementation, this would be async
  return null
}
