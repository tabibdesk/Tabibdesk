import type { Progress } from "@/types/progress"

export interface CreateProgressPayload {
  patient_id: string
  metric: string
  value: number | string
  unit?: string
  notes?: string
}

export interface IProgressRepository {
  list(patientId: string): Promise<Progress[]>
  create(payload: CreateProgressPayload): Promise<Progress>
  delete(id: string): Promise<void>
}
