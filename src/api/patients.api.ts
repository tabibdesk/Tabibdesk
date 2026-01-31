/**
 * Patients API - replaceable backend layer
 * Currently uses mock data, but structured for easy backend replacement
 */

import { mockData } from "@/data/mock/mock-data"
import type { Patient, PatientStatus } from "@/features/patients/patients.types"
import { applyPatientActivation } from "@/features/patients/patientLifecycle"
import { getFollowUpRules } from "@/api/settings.api"
import { listTasks } from "@/features/tasks/tasks.api"
import { listAppointments } from "@/features/appointments/appointments.api"

// In-memory store for created/updated patients (demo mode only)
let patientsStore: Patient[] = []

// Initialize store from mock data
function initializeStore() {
  if (patientsStore.length === 0) {
    patientsStore = [...mockData.patients]
  }
}

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
  initializeStore()
  const { page, pageSize, query, status } = params

  let filtered = [...patientsStore]

  // Filter by status
  if (status) {
    filtered = filtered.filter((p) => p.status === status)
  }

  // Filter by query
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim()
    filtered = filtered.filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
      const phone = patient.phone.toLowerCase()
      const email = (patient.email || "").toLowerCase()
      return fullName.includes(lowerQuery) || phone.includes(lowerQuery) || email.includes(lowerQuery)
    })
  }

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginated = filtered.slice(startIndex, endIndex)
  const total = filtered.length
  const hasMore = endIndex < total

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
  initializeStore()
  const now = new Date().toISOString()

  const newPatient: Patient = {
    id: `patient-${Date.now()}`,
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    email: payload.email || null,
    gender: payload.gender || "",
    address: payload.address || null,
    height: payload.height || null,
    age: payload.age || null,
    date_of_birth: null,
    complaint: payload.complaint || null,
    job: payload.job || null,
    social_status: payload.socialStatus || null,
    source: payload.source || null,
    source_other: payload.sourceOther || null,
    doctor_id: null,
    status: "inactive",
    first_visit_at: null,
    last_visit_at: null,
    created_at: now,
    updated_at: now,
  }

  patientsStore.push(newPatient)
  return newPatient
}

/**
 * Update patient status
 */
export async function updateStatus(patientId: string, status: PatientStatus): Promise<Patient> {
  initializeStore()
  const patient = patientsStore.find((p) => p.id === patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  const updated = {
    ...patient,
    status,
    updated_at: new Date().toISOString(),
  }

  const index = patientsStore.findIndex((p) => p.id === patientId)
  patientsStore[index] = updated

  return updated
}

/**
 * Activate a patient (called when activation event occurs)
 */
export async function activate(patientId: string, _reason: ActivationReason): Promise<Patient> {
  initializeStore()
  const patient = patientsStore.find((p) => p.id === patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  // If already active, just update last_visit_at
  if (patient.status === "active") {
    const updated = {
      ...patient,
      last_visit_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const index = patientsStore.findIndex((p) => p.id === patientId)
    patientsStore[index] = updated
    return updated
  }

  // Apply activation logic
  const activated = applyPatientActivation(patient, new Date().toISOString())
  const index = patientsStore.findIndex((p) => p.id === patientId)
  patientsStore[index] = activated

  return activated
}

/**
 * Get patient by ID
 */
export async function getById(patientId: string): Promise<Patient | null> {
  initializeStore()
  return patientsStore.find((p) => p.id === patientId) || null
}

/**
 * Mark patient as Cold (after max follow-up attempts)
 */
export async function markPatientCold(patientId: string): Promise<Patient> {
  initializeStore()
  const patient = patientsStore.find((p) => p.id === patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  const updated = {
    ...patient,
    is_cold: true,
    updated_at: new Date().toISOString(),
  }

  const index = patientsStore.findIndex((p) => p.id === patientId)
  patientsStore[index] = updated

  return updated
}

/**
 * Update patient's last activity timestamp
 */
export async function updateLastActivity(patientId: string): Promise<Patient> {
  initializeStore()
  const patient = patientsStore.find((p) => p.id === patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  const updated = {
    ...patient,
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const index = patientsStore.findIndex((p) => p.id === patientId)
  patientsStore[index] = updated

  return updated
}

/**
 * Update patient information
 */
export async function update(patientId: string, updates: Partial<Patient>): Promise<Patient> {
  initializeStore()
  const patient = patientsStore.find((p) => p.id === patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  const updated = {
    ...patient,
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const index = patientsStore.findIndex((p) => p.id === patientId)
  patientsStore[index] = updated

  // Also update in mockData if patient exists there
  const mockIndex = mockData.patients.findIndex((p) => p.id === patientId)
  if (mockIndex !== -1) {
    mockData.patients[mockIndex] = updated as any
  }

  return updated
}

/**
 * Check if patient is inactive based on follow-up rules
 * Patient is inactive if:
 * - last_activity_at older than inactivityDaysThreshold
 * - AND no upcoming appointments
 * - AND no open tasks
 */
export async function isPatientInactive(
  patientId: string,
  clinicId: string
): Promise<boolean> {
  initializeStore()
  const patient = patientsStore.find((p) => p.id === patientId)
  if (!patient) {
    return false
  }

  // Get follow-up rules for inactivity threshold
  const rules = await getFollowUpRules(clinicId)
  const thresholdDays = rules.inactivityDaysThreshold

  // Check last_activity_at
  const lastActivity = patient.last_activity_at || patient.last_visit_at || patient.created_at
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceActivity < thresholdDays) {
    return false // Recently active
  }

  // Check for upcoming appointments
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
      (apt) => apt.patient_id === patientId && new Date(apt.scheduled_at) > now
    )

    if (hasUpcomingAppointment) {
      return false // Has upcoming appointment
    }
  } catch (error) {
    console.warn("Failed to check appointments for inactivity:", error)
  }

  // Check for open tasks
  try {
    const tasks = await listTasks({
      clinicId,
      page: 1,
      pageSize: 100,
      status: "pending",
    })

    const hasOpenTask = tasks.tasks.some((task) => task.patientId === patientId)

    if (hasOpenTask) {
      return false // Has open task
    }
  } catch (error) {
    console.warn("Failed to check tasks for inactivity:", error)
  }

  // All conditions met - patient is inactive
  return true
}
