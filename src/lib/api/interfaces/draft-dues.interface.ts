import type { DraftDue } from "@/types/draft-due"

export interface CreateDraftDuePayload {
  clinic_id: string
  patient_id: string
  amount: number
  reason: string
  due_date?: string
}

export interface IDraftDuesRepository {
  list(clinicId: string): Promise<DraftDue[]>
  create(payload: CreateDraftDuePayload): Promise<DraftDue>
  update(id: string, updates: Partial<DraftDue>): Promise<DraftDue>
  delete(id: string): Promise<void>
}
