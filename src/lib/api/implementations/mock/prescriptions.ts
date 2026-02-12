import { mockData } from "@/data/mock/mock-data"
import type { IPrescriptionsRepository, CreatePrescriptionPayload } from "../../interfaces/prescriptions.interface"
import type { Prescription } from "@/features/prescriptions/prescriptions.types"

let prescriptionsStore: Prescription[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    prescriptionsStore = mockData.prescriptions.map((p) => ({
      id: p.id,
      patient_id: p.patient_id,
      doctor_id: p.doctor_id,
      medication: p.medication,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      notes: p.notes,
      created_at: p.created_at,
    }))
    initialized = true
  }
}

function generateId(): string {
  return `presc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockPrescriptionsRepository implements IPrescriptionsRepository {
  async list(patientId: string): Promise<Prescription[]> {
    initStore()
    return prescriptionsStore.filter((p) => p.patient_id === patientId)
  }

  async getById(id: string): Promise<Prescription | null> {
    initStore()
    return prescriptionsStore.find((p) => p.id === id) || null
  }

  async create(payload: CreatePrescriptionPayload): Promise<Prescription> {
    initStore()
    const prescription: Prescription = {
      id: generateId(),
      patient_id: payload.patient_id,
      doctor_id: payload.doctor_id,
      medication: payload.medication,
      dosage: payload.dosage,
      frequency: payload.frequency,
      duration: payload.duration,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    }
    prescriptionsStore.push(prescription)
    return prescription
  }

  async update(id: string, updates: Partial<Prescription>): Promise<Prescription> {
    initStore()
    const index = prescriptionsStore.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Prescription not found")
    prescriptionsStore[index] = { ...prescriptionsStore[index], ...updates }
    return prescriptionsStore[index]
  }

  async delete(id: string): Promise<void> {
    initStore()
    prescriptionsStore = prescriptionsStore.filter((p) => p.id !== id)
  }
}
