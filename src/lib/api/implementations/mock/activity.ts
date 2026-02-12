import { mockData } from "@/data/mock/mock-data"
import type { IActivityRepository, CreateActivityPayload } from "../../interfaces/activity.interface"
import type { Activity } from "@/types/activity"

let activityStore: Activity[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    activityStore = mockData.activities?.map((a) => ({
      id: a.id,
      clinic_id: a.clinic_id,
      user_id: a.user_id,
      action: a.action,
      resource_type: a.resource_type,
      resource_id: a.resource_id,
      metadata: a.metadata,
      created_at: a.created_at,
    })) || []
    initialized = true
  }
}

function generateId(): string {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockActivityRepository implements IActivityRepository {
  async list(clinicId: string, limit: number = 50): Promise<Activity[]> {
    initStore()
    return activityStore
      .filter((a) => a.clinic_id === clinicId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  async create(payload: CreateActivityPayload): Promise<Activity> {
    initStore()
    const activity: Activity = {
      id: generateId(),
      clinic_id: payload.clinic_id,
      user_id: payload.user_id,
      action: payload.action,
      resource_type: payload.resource_type,
      resource_id: payload.resource_id,
      metadata: payload.metadata,
      created_at: new Date().toISOString(),
    }
    activityStore.push(activity)
    return activity
  }

  async getByResource(resourceType: string, resourceId: string): Promise<Activity[]> {
    initStore()
    return activityStore.filter((a) => a.resource_type === resourceType && a.resource_id === resourceId)
  }
}
