/**
 * Mock patients repository - in-memory store, no direct mockData mutations.
 */

import { mockData } from "@/data/mock/mock-data"
import { mockClinics } from "@/data/mock/users-clinics"
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
    return patientsStore.find((p) => p.id === patientId) ?? null
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
    const updated: PatientRow = {
      ...patientsStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
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
