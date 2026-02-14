import type { IDraftDuesRepository, CreateDraftDuePayload } from "../../interfaces/draft-dues.interface"
import type { DraftDue, ChargeLineItem } from "@/types/draft-due"

let draftDuesStore: DraftDue[] = []

function generateId(): string {
  return `dd-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockDraftDuesRepository implements IDraftDuesRepository {
  async list(clinicId: string): Promise<DraftDue[]> {
    return draftDuesStore.filter((d) => d.clinicId === clinicId)
  }

  async create(payload: CreateDraftDuePayload): Promise<DraftDue> {
    const now = new Date().toISOString()
    const lineItems: ChargeLineItem[] = [{ id: "1", type: "consultation", label: "Consultation", amount: payload.amount }]
    const draftDue: DraftDue = {
      id: generateId(),
      clinicId: payload.clinic_id,
      patientId: payload.patient_id,
      doctorId: "",
      appointmentId: null,
      status: "draft",
      lineItems,
      total: payload.amount,
      createdAt: now,
      updatedAt: now,
    }
    draftDuesStore.push(draftDue)
    return draftDue
  }

  async update(id: string, updates: Partial<DraftDue>): Promise<DraftDue> {
    const index = draftDuesStore.findIndex((d) => d.id === id)
    if (index === -1) throw new Error("Draft due not found")
    draftDuesStore[index] = { ...draftDuesStore[index], ...updates }
    return draftDuesStore[index]
  }

  async delete(id: string): Promise<void> {
    draftDuesStore = draftDuesStore.filter((d) => d.id !== id)
  }
}
