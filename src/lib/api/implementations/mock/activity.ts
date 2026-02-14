import type { IActivityRepository, CreateActivityPayload } from "../../interfaces/activity.interface"
import type { ActivityEvent } from "@/types/activity"

let activityStore: ActivityEvent[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    activityStore = []
    initialized = true
  }
}

function generateId(): string {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockActivityRepository implements IActivityRepository {
  async list(clinicId: string, limit: number = 50): Promise<ActivityEvent[]> {
    initStore()
    return activityStore
      .filter((a) => a.clinicId === clinicId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  async create(payload: CreateActivityPayload): Promise<ActivityEvent> {
    initStore()
    const activity: ActivityEvent = {
      id: generateId(),
      clinicId: payload.clinic_id,
      actorUserId: payload.user_id,
      actorName: "User",
      action: payload.action as ActivityEvent["action"],
      entityType: payload.resource_type as ActivityEvent["entityType"],
      entityId: payload.resource_id,
      message: payload.action,
      createdAt: new Date().toISOString(),
      meta: payload.metadata,
    }
    activityStore.push(activity)
    return activity
  }

  async getByResource(resourceType: string, resourceId: string): Promise<ActivityEvent[]> {
    initStore()
    return activityStore.filter((a) => a.entityType === resourceType && a.entityId === resourceId)
  }
}
