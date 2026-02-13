/**
 * Patients API - business logic layer.
 * Uses repository factory for data access (mock or Supabase).
 */

import { getPatientsRepository } from "@/lib/api/repository-factory"
import { DEMO_CLINIC_ID } from "@/lib/constants"
import type { Patient, PatientStatus } from "@/features/patients/patients.types"
import { applyPatientActivation } from "@/features/patients/patientLifecycle"
import { getFollowUpRules } from "@/api/settings.api"
import { listAppointments } from "@/features/appointments/appointments.api"
import { NotFoundError } from "@/lib/api/errors"

export interface ListPatientsParams {
  clinicId?: string
  status?: PatientStatus
  query?: string
  page: number
  pageSize: number
}

export interface ListPatientsResponse {
  patients: Patient[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreatePatientPayload {
  firstName: string
  lastName: string
  phone: string
  email?: string
  gender?: string
  source?: string
  sourceOther?: string
  address?: string
  age?: number
  height?: number
  job?: string
  socialStatus?: string
  complaint?: string
}

export type ActivationReason = "in_progress" | "completed" | "visit_note"

/**
 * List patients with filtering and pagination
 */
export async function list(params: ListPatientsParams): Promise<ListPatientsResponse> {
  const repo = await getPatientsRepository()
  const clinicId = params.clinicId ?? DEMO_CLINIC_ID
  const { page, pageSize, query, status } = params

  let patients = await repo.getPatients(clinicId)

  if (status) {
    patients = patients.filter((p) => p.status === status)
  }

  if (query?.trim()) {
    patients = await repo.searchPatients(clinicId, query.trim())
    if (status) {
      patients = patients.filter((p) => p.status === status)
    }
  }

  const total = patients.length
  const startIndex = (page - 1) * pageSize
  const paginated = patients.slice(startIndex, startIndex + pageSize)
  const hasMore = startIndex + pageSize < total

  return {
    patients: paginated,
    total,
    page,
    pageSize,
    hasMore,
  }
}

/**
 * Create a new patient (starts as inactive)
 */
export async function create(payload: CreatePatientPayload): Promise<Patient> {
  const repo = await getPatientsRepository()
  const clinicId = DEMO_CLINIC_ID

  const patient = await repo.createPatient({
    clinic_id: clinicId,
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    email: payload.email ?? null,
    gender: payload.gender ?? "",
    address: payload.address ?? null,
    height: payload.height ?? null,
    age: payload.age ?? null,
    complaint: payload.complaint ?? null,
    job: payload.job ?? null,
    social_status: payload.socialStatus ?? null,
    source: payload.source ?? null,
    status: "inactive",
  })

  return patient
}

/**
 * Update patient status
 */
export async function updateStatus(patientId: string, status: PatientStatus): Promise<Patient> {
  const repo = await getPatientsRepository()
  const clinicId = DEMO_CLINIC_ID
  await repo.getPatient(patientId, clinicId)
  return repo.updatePatient(patientId, clinicId, { status })
}

/**
 * Activate a patient (called when activation event occurs)
 */
export async function activate(patientId: string, _reason: ActivationReason): Promise<Patient> {
  const repo = await getPatientsRepository()
  const clinicId = DEMO_CLINIC_ID
  const patient = await repo.getPatient(patientId, clinicId)

  if (patient.status === "active") {
    return repo.updatePatient(patientId, clinicId, {
      last_visit_at: new Date().toISOString(),
    })
  }

  const activated = applyPatientActivation(patient, new Date().toISOString())
  return repo.updatePatient(patientId, clinicId, {
    status: activated.status,
    first_visit_at: activated.first_visit_at,
    last_visit_at: activated.last_visit_at,
  })
}

/**
 * Get patient by ID
 */
export async function getById(patientId: string): Promise<Patient | null> {
  const repo = await getPatientsRepository()
  return repo.getById(patientId)
}

/**
 * Mark patient as Cold (after max follow-up attempts)
 */
export async function markPatientCold(patientId: string): Promise<Patient> {
  const repo = await getPatientsRepository()
  const clinicId = DEMO_CLINIC_ID
  await repo.getPatient(patientId, clinicId)
  return repo.updatePatient(patientId, clinicId, { is_cold: true })
}

/**
 * Update patient's last activity timestamp
 */
export async function updateLastActivity(patientId: string): Promise<Patient> {
  const repo = await getPatientsRepository()
  const clinicId = DEMO_CLINIC_ID
  await repo.getPatient(patientId, clinicId)
  return repo.updatePatient(patientId, clinicId, {
    last_activity_at: new Date().toISOString(),
  })
}

/**
 * Update patient information
 */
export async function update(
  patientId: string,
  updates: Partial<Patient>,
  clinicId?: string
): Promise<Patient> {
  const repo = await getPatientsRepository()
  const effectiveClinicId = clinicId ?? DEMO_CLINIC_ID

  try {
    await repo.getPatient(patientId, effectiveClinicId)
  } catch (e) {
    if (e instanceof NotFoundError) throw new Error("Patient not found")
    throw e
  }

  return repo.updatePatient(patientId, effectiveClinicId, updates)
}

/**
 * Check if patient is inactive based on follow-up rules
 */
export async function isPatientInactive(
  patientId: string,
  clinicId: string
): Promise<boolean> {
  const repo = await getPatientsRepository()
  const patient = await repo.getById(patientId)
  if (!patient) return false

  const rules = await getFollowUpRules(clinicId)
  const thresholdDays = rules.inactivityDaysThreshold
  const lastActivity =
    patient.last_activity_at ?? patient.last_visit_at ?? patient.created_at
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceActivity < thresholdDays) return false

  try {
    const now = new Date()
    const appointments = await listAppointments({
      clinicId,
      page: 1,
      pageSize: 100,
      query: "",
      status: "all",
      timeFilter: "upcoming",
    })
    const hasUpcomingAppointment = appointments.appointments.some(
      (apt) =>
        apt.patient_id === patientId && new Date(apt.scheduled_at) > now
    )
    if (hasUpcomingAppointment) return false
  } catch (error) {
    console.warn("Failed to check appointments for inactivity:", error)
  }

  try {
    // TODO: Re-enable task checking once tasks.api exports listTasks
    // const tasks = await listTasks({
    //   clinicId,
    //   page: 1,
    //   pageSize: 100,
    //   status: "pending",
    // })
    // const hasOpenTask = tasks.tasks.some((task) => task.patientId === patientId)
    // if (hasOpenTask) return false
  } catch (error) {
    console.warn("Failed to check tasks for inactivity:", error)
  }

  return true
}
