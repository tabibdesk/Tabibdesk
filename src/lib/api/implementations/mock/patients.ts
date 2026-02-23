/**
 * Mock patients repository - in-memory store, no direct mockData mutations.
 */

import { mockData } from "@/data/mock/mock-data"
import { mockClinics } from "@/data/mock/users-clinics"
import { MEDICAL_CONDITIONS } from "@/features/patients/detail/medical-conditions"

const LEGACY_CONDITION_IDS = new Set([
  "is_diabetic",
  "is_hypertensive",
  "has_pancreatitis",
  "has_gerd",
  "has_gastritis",
  "has_hepatic",
  "has_anaemia",
  "has_bronchial_asthma",
  "has_rheumatoid",
  "has_ihd",
  "has_heart_failure",
  "is_pregnant",
  "is_breastfeeding",
  "glp1a_previous_exposure",
])
const CONDITION_IDS = new Set(MEDICAL_CONDITIONS.map((c) => c.id))
import type {
  IPatientsRepository,
  PatientRow,
  PatientInsert,
  PatientUpdate,
} from "../../interfaces/patients.interface"
import { NotFoundError } from "../../errors"

let patientsStore: PatientRow[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    const clinicIds = mockClinics.map((c) => c.id)
    patientsStore = mockData.patients.map((p, i) => ({
      ...p,
      clinic_id: clinicIds[i % clinicIds.length],
    })) as PatientRow[]
    initialized = true
  }
}

function generateId(): string {
  return `patient-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockPatientsRepository implements IPatientsRepository {
  async getPatients(clinicId: string): Promise<PatientRow[]> {
    initStore()
    return patientsStore.filter((p) => p.clinic_id === clinicId)
  }

  async getPatient(id: string, clinicId: string): Promise<PatientRow> {
    initStore()
    const patient = patientsStore.find(
      (p) => p.id === id && p.clinic_id === clinicId
    )
    if (!patient) throw new NotFoundError("Patient", id)
    return patient
  }

  async getById(patientId: string): Promise<PatientRow | null> {
    initStore()
    const raw = patientsStore.find((p) => p.id === patientId) ?? null
    if (!raw) return null
    // Merge condition_flags so patient[c.id] works for UI
    const flags = (raw as unknown as Record<string, unknown>).condition_flags as Record<string, boolean> | undefined
    if (!flags || Object.keys(flags).length === 0) return raw as PatientRow
    return { ...raw, ...flags } as PatientRow
  }

  async createPatient(insert: PatientInsert): Promise<PatientRow> {
    initStore()
    const now = new Date().toISOString()
    const patient: PatientRow = {
      id: generateId(),
      clinic_id: insert.clinic_id,
      first_name: insert.first_name,
      last_name: insert.last_name,
      phone: insert.phone,
      email: insert.email ?? null,
      gender: insert.gender ?? "",
      date_of_birth: insert.date_of_birth ?? null,
      age: insert.age ?? null,
      address: insert.address ?? null,
      height: null,
      complaint: insert.complaint ?? null,
      job: insert.job ?? null,
      social_status: insert.social_status ?? null,
      source: insert.source ?? null,
      source_other: null,
      doctor_id: insert.doctor_id ?? null,
      status: insert.status ?? "inactive",
      first_visit_at: null,
      last_visit_at: null,
      last_activity_at: null,
      created_at: now,
      updated_at: now,
    }
    patientsStore.push(patient)
    return patient
  }

  async updatePatient(
    id: string,
    clinicId: string,
    updates: PatientUpdate
  ): Promise<PatientRow> {
    initStore()
    const index = patientsStore.findIndex(
      (p) => p.id === id && p.clinic_id === clinicId
    )
    if (index === -1) throw new NotFoundError("Patient", id)
    const current = patientsStore[index] as unknown as Record<string, unknown>
    const legacyUpdates: Record<string, unknown> = {}
    const existingFlags = (current.condition_flags as Record<string, boolean> | undefined) ?? {}
    const conditionFlagUpdates: Record<string, boolean> = { ...existingFlags }
    for (const [key, value] of Object.entries(updates)) {
      if (CONDITION_IDS.has(key) && !LEGACY_CONDITION_IDS.has(key)) {
        conditionFlagUpdates[key] = !!value
      } else {
        legacyUpdates[key] = value
      }
    }
    const updated: PatientRow = {
      ...patientsStore[index],
      ...legacyUpdates,
      condition_flags: Object.keys(conditionFlagUpdates).length > 0 ? conditionFlagUpdates : undefined,
      updated_at: new Date().toISOString(),
    } as PatientRow
    patientsStore[index] = updated
    return updated
  }

  async deletePatient(id: string, clinicId: string): Promise<void> {
    initStore()
    const index = patientsStore.findIndex(
      (p) => p.id === id && p.clinic_id === clinicId
    )
    if (index === -1) throw new NotFoundError("Patient", id)
    patientsStore.splice(index, 1)
  }

  async searchPatients(clinicId: string, query: string): Promise<PatientRow[]> {
    initStore()
    const lowerQuery = query.toLowerCase().trim()
    return patientsStore.filter((p) => {
      if (p.clinic_id !== clinicId) return false
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
      const phone = (p.phone ?? "").toLowerCase()
      const email = (p.email ?? "").toLowerCase()
      return (
        fullName.includes(lowerQuery) ||
        phone.includes(lowerQuery) ||
        email.includes(lowerQuery)
      )
    })
  }
}
