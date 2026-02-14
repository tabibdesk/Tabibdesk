import type { IPrescriptionsRepository, CreatePrescriptionPayload } from "../../interfaces/prescriptions.interface"
import type { Prescription, PrescriptionItem } from "@/features/prescriptions/prescriptions.types"

let prescriptionsStore: Prescription[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    prescriptionsStore = []
    initialized = true
  }
}

function generateId(): string {
  return `presc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockPrescriptionsRepository implements IPrescriptionsRepository {
  async list(patientId: string): Promise<Prescription[]> {
    initStore()
    return prescriptionsStore.filter((p) => p.patientId === patientId)
  }

  async getById(id: string): Promise<Prescription | null> {
    initStore()
    return prescriptionsStore.find((p) => p.id === id) || null
  }

  async create(payload: CreatePrescriptionPayload): Promise<Prescription> {
    initStore()
    const now = new Date().toISOString()
    const item: PrescriptionItem = {
      id: generateId(),
      name: payload.medication,
      strength: payload.dosage,
      sig: `${payload.frequency}, ${payload.duration}`,
      duration: payload.duration,
      notes: payload.notes,
    }
    const prescription: Prescription = {
      id: generateId(),
      clinicId: "",
      patientId: payload.patient_id,
      doctorId: payload.doctor_id,
      createdAt: now,
      diagnosisText: "",
      items: [item],
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
