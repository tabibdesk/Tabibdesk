import type { IDraftDuesRepository, CreateDraftDuePayload } from "../../interfaces/draft-dues.interface"
import type { DraftDue } from "@/types/draft-due"

let draftDuesStore: DraftDue[] = []

function generateId(): string {
  return `dd-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockDraftDuesRepository implements IDraftDuesRepository {
  async list(clinicId: string): Promise<DraftDue[]> {
    return draftDuesStore.filter((d) => d.clinic_id === clinicId)
  }

  async create(payload: CreateDraftDuePayload): Promise<DraftDue> {
    const draftDue: DraftDue = {
      id: generateId(),
      clinic_id: payload.clinic_id,
      patient_id: payload.patient_id,
      amount: payload.amount,
      reason: payload.reason,
      due_date: payload.due_date,
      created_at: new Date().toISOString(),
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
