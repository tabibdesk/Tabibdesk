import { mockData } from "@/data/mock/mock-data"
import type { IProgressRepository, CreateProgressPayload } from "../../interfaces/progress.interface"
import type { Progress } from "@/types/progress"

let progressStore: Progress[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    progressStore = mockData.progress || []
    initialized = true
  }
}

function generateId(): string {
  return `prog-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockProgressRepository implements IProgressRepository {
  async list(patientId: string): Promise<Progress[]> {
    initStore()
    return progressStore.filter((p) => p.patient_id === patientId)
  }

  async create(payload: CreateProgressPayload): Promise<Progress> {
    initStore()
    const progress: Progress = {
      id: generateId(),
      patient_id: payload.patient_id,
      metric: payload.metric,
      value: payload.value,
      unit: payload.unit,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    }
    progressStore.push(progress)
    return progress
  }

  async delete(id: string): Promise<void> {
    initStore()
    progressStore = progressStore.filter((p) => p.id !== id)
  }
}
